from django.http import JsonResponse
from .models import SocketGroup, GroupConnection

def status(request):
    """API endpoint to check server status and active connections"""
    groups = SocketGroup.objects.all()
    group_data = []
    
    for group in groups:
        connections = GroupConnection.objects.filter(group=group).count()
        group_data.append({
            'name': group.group_name,
            'connections': connections
        })
    
    return JsonResponse({
        'status': 'online',
        'groups': group_data
    })