from django.db import models
from enum import Enum

class ActionType(Enum):
    JOIN = "JOIN"
    LEAVE = "LEAVE"
    OFFER = "OFFER"
    ANSWER = "ANSWER"
    ICE_CANDIDATE = "ICE_CANDIDATE"
    GROUP_JOIN = "GROUP_JOIN"
    GROUP_LEAVE = "GROUP_LEAVE"
    ANNOUNCE = "ANNOUNCE"
    CUSTOM = "CUSTOM"

class UserData(models.Model):
    username = models.CharField(max_length=255, null=True, blank=True)
    socket_id = models.CharField(max_length=255, null=True, blank=True)
    
    def __str__(self):
        return f"{self.username} ({self.socket_id})"
    
class SocketGroup(models.Model):
    group_name = models.CharField(max_length=255)
    group_secret = models.CharField(max_length=255, null=True, blank=True)
    
    def __str__(self):
        return self.group_name

class GroupConnection(models.Model):
    group = models.ForeignKey(SocketGroup, on_delete=models.CASCADE, related_name='connections')
    connection_id = models.CharField(max_length=255)
    
    class Meta:
        unique_together = ('group', 'connection_id')
