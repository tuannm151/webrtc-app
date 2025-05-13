import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import ActionType, UserData, SocketGroup, GroupConnection

class RTCConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_data = None
        await self.accept()
    
    async def disconnect(self, close_code):
        if self.user_data:
            # Remove from all groups
            groups = await self.get_user_groups(self.channel_name)
            for group in groups:
                await self.channel_layer.group_discard(
                    group,
                    self.channel_name
                )
            
            # Announce disconnect to all groups
            for group in groups:
                await self.channel_layer.group_send(
                    group,
                    {
                        'type': 'rtc_message',
                        'message': {
                            'ActionType': ActionType.LEAVE.value,
                            'SourceId': self.channel_name,
                            'GroupName': group,
                            'Announce': f"{self.user_data.username} has left"
                        }
                    }
                )
    
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            action_type = data.get('ActionType')
            print(f"Received data: {data}")
            
            # Handle different message types
            if action_type == ActionType.JOIN.value:
                username = data.get('Data')
                await self.handle_join(username)
            
            elif action_type == ActionType.GROUP_JOIN.value:
                group_name = data.get('GroupName')
                group_secret = data.get('GroupSecret')
                await self.handle_group_join(group_name, group_secret)
            
            elif action_type == ActionType.GROUP_LEAVE.value:
                group_name = data.get('GroupName')
                await self.handle_group_leave(group_name)
            
            elif action_type in [ActionType.OFFER.value, ActionType.ANSWER.value, ActionType.ICE_CANDIDATE.value]:
                # Forward signaling messages
                dest_id = data.get('DestId')
                if dest_id:
                    await self.channel_layer.send(
                        dest_id,
                        {
                            'type': 'rtc_message',
                            'message': data
                        }
                    )
                
                # If group is specified, send to the whole group
                group_name = data.get('GroupName')
                if group_name:
                    await self.channel_layer.group_send(
                        group_name,
                        {
                            'type': 'rtc_message',
                            'message': data
                        }
                    )
            
            elif action_type == ActionType.CUSTOM.value:
                # Handle custom messages
                group_name = data.get('GroupName')
                if group_name:
                    await self.channel_layer.group_send(
                        group_name,
                        {
                            'type': 'rtc_message',
                            'message': data
                        }
                    )
        
        except Exception as e:
            await self.send(text_data=json.dumps({
                'ActionType': ActionType.CUSTOM.value,
                'Data': f"Error: {str(e)}"
            }))
    
    async def rtc_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps(message))
    
    async def handle_join(self, username):
        # Create or update user data
        self.user_data = await self.create_or_update_user(username, self.channel_name)
        
        # Send confirmation
        await self.send(text_data=json.dumps({
            'ActionType': ActionType.JOIN.value,
            'SourceId': self.channel_name,
            'Data': username,
            'Announce': f"Welcome {username}!"
        }))
    
    async def handle_group_join(self, group_name, group_secret=None):
        if not self.user_data:
            await self.send(text_data=json.dumps({
                'ActionType': ActionType.CUSTOM.value,
                'Data': "Error: You must join with a username first"
            }))
            return
        
        # Create or get group
        group = await self.get_or_create_group(group_name, group_secret)
        
        # Add connection to group
        await self.add_connection_to_group(group, self.channel_name)
        
        # Join the channel layer group
        await self.channel_layer.group_add(
            group_name,
            self.channel_name
        )
        
        # Get all connections in the group
        connections = await self.get_group_connections(group)
        
        # Announce to the group
        await self.channel_layer.group_send(
            group_name,
            {
                'type': 'rtc_message',
                'message': {
                    'ActionType': ActionType.GROUP_JOIN.value,
                    'SourceId': self.channel_name,
                    'GroupName': group_name,
                    'Data': json.dumps(connections),
                    'Announce': f"{self.user_data.username} has joined the group"
                }
            }
        )
    
    async def handle_group_leave(self, group_name):
        if not self.user_data:
            return
        
        # Remove from channel layer group
        await self.channel_layer.group_discard(
            group_name,
            self.channel_name
        )
        
        # Remove from database
        await self.remove_connection_from_group(group_name, self.channel_name)
        
        # Announce to the group
        await self.channel_layer.group_send(
            group_name,
            {
                'type': 'rtc_message',
                'message': {
                    'ActionType': ActionType.GROUP_LEAVE.value,
                    'SourceId': self.channel_name,
                    'GroupName': group_name,
                    'Announce': f"{self.user_data.username} has left the group"
                }
            }
        )
    
    @database_sync_to_async
    def create_or_update_user(self, username, socket_id):
        user, created = UserData.objects.update_or_create(
            socket_id=socket_id,
            defaults={'username': username}
        )
        return user
    
    @database_sync_to_async
    def get_or_create_group(self, group_name, group_secret=None):
        group, created = SocketGroup.objects.get_or_create(
            group_name=group_name,
            defaults={'group_secret': group_secret}
        )
        return group
    
    @database_sync_to_async
    def add_connection_to_group(self, group, connection_id):
        GroupConnection.objects.get_or_create(
            group=group,
            connection_id=connection_id
        )
    
    @database_sync_to_async
    def remove_connection_from_group(self, group_name, connection_id):
        GroupConnection.objects.filter(
            group__group_name=group_name,
            connection_id=connection_id
        ).delete()
    
    @database_sync_to_async
    def get_group_connections(self, group):
        connections = GroupConnection.objects.filter(group=group).values_list('connection_id', flat=True)
        return list(connections)
    
    @database_sync_to_async
    def get_user_groups(self, connection_id):
        groups = GroupConnection.objects.filter(
            connection_id=connection_id
        ).values_list('group__group_name', flat=True)
        return list(groups)