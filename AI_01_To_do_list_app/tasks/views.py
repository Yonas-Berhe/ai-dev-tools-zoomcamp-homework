from django.shortcuts import render, redirect, get_object_or_404
from django.views.decorators.http import require_http_methods
from .models import Task

# Create your views here.

def task_list(request):
    """Display all tasks"""
    tasks = Task.objects.all()
    return render(request, 'tasks/task_list.html', {'tasks': tasks})

def task_create(request):
    """Create a new task"""
    if request.method == 'POST':
        title = request.POST.get('title')
        description = request.POST.get('description', '')
        due_date = request.POST.get('due_date') or None
        if title:
            Task.objects.create(title=title, description=description, due_date=due_date)
        return redirect('task_list')
    return render(request, 'tasks/task_form.html')

def task_update(request, pk):
    """Update an existing task"""
    task = get_object_or_404(Task, pk=pk)
    if request.method == 'POST':
        task.title = request.POST.get('title')
        task.description = request.POST.get('description', '')
        task.due_date = request.POST.get('due_date') or None
        task.save()
        return redirect('task_list')
    return render(request, 'tasks/task_form.html', {'task': task})

def task_delete(request, pk):
    """Delete a task"""
    task = get_object_or_404(Task, pk=pk)
    if request.method == 'POST':
        task.delete()
        return redirect('task_list')
    return render(request, 'tasks/task_confirm_delete.html', {'task': task})

def task_toggle(request, pk):
    """Toggle task completion status"""
    task = get_object_or_404(Task, pk=pk)
    task.completed = not task.completed
    task.save()
    return redirect('task_list')
