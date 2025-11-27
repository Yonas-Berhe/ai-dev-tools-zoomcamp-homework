from django.test import TestCase, Client
from django.urls import reverse
from datetime import date, timedelta
from .models import Task

# Create your tests here.

class TaskModelTest(TestCase):
    """Test the Task model"""
    
    def test_task_creation_with_all_fields(self):
        """Test creating a task with all fields"""
        task = Task.objects.create(
            title="Test Task",
            description="Test Description",
            due_date=date.today() + timedelta(days=7)
        )
        self.assertEqual(task.title, "Test Task")
        self.assertEqual(task.description, "Test Description")
        self.assertFalse(task.completed)
        self.assertIsNotNone(task.due_date)
    
    def test_task_creation_with_minimal_fields(self):
        """Test creating a task with only required fields"""
        task = Task.objects.create(title="Minimal Task")
        self.assertEqual(task.title, "Minimal Task")
        self.assertIsNone(task.description)
        self.assertIsNone(task.due_date)
    
    def test_task_default_completed_is_false(self):
        """Test that completed defaults to False"""
        task = Task.objects.create(title="New Task")
        self.assertFalse(task.completed)
    
    def test_task_string_representation(self):
        """Test __str__ method returns title"""
        task = Task.objects.create(title="String Test")
        self.assertEqual(str(task), "String Test")
    
    def test_task_ordering(self):
        """Test tasks are ordered by created_at (newest first)"""
        task1 = Task.objects.create(title="First")
        task2 = Task.objects.create(title="Second")
        task3 = Task.objects.create(title="Third")
        tasks = Task.objects.all()
        self.assertEqual(tasks[0].title, "Third")
        self.assertEqual(tasks[2].title, "First")


class TaskListViewTest(TestCase):
    """Test the task list view"""
    
    def setUp(self):
        self.client = Client()
        self.url = reverse('task_list')
    
    def test_task_list_view_displays_tasks(self):
        """Test that task list view displays all tasks"""
        Task.objects.create(title="Task 1")
        Task.objects.create(title="Task 2")
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Task 1")
        self.assertContains(response, "Task 2")
    
    def test_task_list_view_empty_state(self):
        """Test task list view when no tasks exist"""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "No tasks yet")


class TaskCreateViewTest(TestCase):
    """Test the task create view"""
    
    def setUp(self):
        self.client = Client()
        self.url = reverse('task_create')
    
    def test_task_create_get_request(self):
        """Test GET request shows form"""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Add New Task")
    
    def test_task_create_post_with_all_fields(self):
        """Test POST creates task with all fields"""
        data = {
            'title': 'New Task',
            'description': 'Task description',
            'due_date': '2025-12-31'
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, 302)  # Redirect
        self.assertEqual(Task.objects.count(), 1)
        task = Task.objects.first()
        self.assertEqual(task.title, 'New Task')
        self.assertEqual(task.description, 'Task description')
        self.assertIsNotNone(task.due_date)
    
    def test_task_create_post_with_minimal_data(self):
        """Test POST with only title works"""
        data = {'title': 'Minimal Task'}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, 302)
        self.assertEqual(Task.objects.count(), 1)
        task = Task.objects.first()
        self.assertEqual(task.title, 'Minimal Task')
    
    def test_task_create_post_without_title(self):
        """Test POST without title doesn't create task"""
        data = {'description': 'No title'}
        response = self.client.post(self.url, data)
        self.assertEqual(Task.objects.count(), 0)


class TaskUpdateViewTest(TestCase):
    """Test the task update view"""
    
    def setUp(self):
        self.client = Client()
        self.task = Task.objects.create(
            title="Original Title",
            description="Original Description"
        )
        self.url = reverse('task_update', args=[self.task.pk])
    
    def test_task_update_get_request(self):
        """Test GET request shows pre-filled form"""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Original Title")
        self.assertContains(response, "Original Description")
    
    def test_task_update_post_updates_task(self):
        """Test POST updates task correctly"""
        data = {
            'title': 'Updated Title',
            'description': 'Updated Description',
            'due_date': '2025-12-25'
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, 302)
        self.task.refresh_from_db()
        self.assertEqual(self.task.title, 'Updated Title')
        self.assertEqual(self.task.description, 'Updated Description')
    
    def test_task_update_nonexistent_task_returns_404(self):
        """Test updating non-existent task returns 404"""
        url = reverse('task_update', args=[9999])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 404)


class TaskDeleteViewTest(TestCase):
    """Test the task delete view"""
    
    def setUp(self):
        self.client = Client()
        self.task = Task.objects.create(title="Task to Delete")
        self.url = reverse('task_delete', args=[self.task.pk])
    
    def test_task_delete_get_request(self):
        """Test GET request shows confirmation page"""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Are you sure")
        self.assertContains(response, "Task to Delete")
    
    def test_task_delete_post_deletes_task(self):
        """Test POST deletes task"""
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, 302)
        self.assertEqual(Task.objects.count(), 0)
    
    def test_task_delete_nonexistent_task_returns_404(self):
        """Test deleting non-existent task returns 404"""
        url = reverse('task_delete', args=[9999])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 404)


class TaskToggleViewTest(TestCase):
    """Test the task toggle view"""
    
    def setUp(self):
        self.client = Client()
        self.task = Task.objects.create(title="Toggle Task", completed=False)
        self.url = reverse('task_toggle', args=[self.task.pk])
    
    def test_task_toggle_from_false_to_true(self):
        """Test toggling completed from False to True"""
        self.assertFalse(self.task.completed)
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, 302)
        self.task.refresh_from_db()
        self.assertTrue(self.task.completed)
    
    def test_task_toggle_from_true_to_false(self):
        """Test toggling completed from True to False"""
        self.task.completed = True
        self.task.save()
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, 302)
        self.task.refresh_from_db()
        self.assertFalse(self.task.completed)
    
    def test_task_toggle_nonexistent_task_returns_404(self):
        """Test toggling non-existent task returns 404"""
        url = reverse('task_toggle', args=[9999])
        response = self.client.post(url)
        self.assertEqual(response.status_code, 404)


class TaskURLTest(TestCase):
    """Test URL routing"""
    
    def test_task_list_url_resolves(self):
        """Test task list URL resolves correctly"""
        url = reverse('task_list')
        self.assertEqual(url, '/')
    
    def test_task_create_url_resolves(self):
        """Test task create URL resolves correctly"""
        url = reverse('task_create')
        self.assertEqual(url, '/create/')
    
    def test_task_update_url_resolves(self):
        """Test task update URL resolves correctly"""
        url = reverse('task_update', args=[1])
        self.assertEqual(url, '/update/1/')
    
    def test_task_delete_url_resolves(self):
        """Test task delete URL resolves correctly"""
        url = reverse('task_delete', args=[1])
        self.assertEqual(url, '/delete/1/')
    
    def test_task_toggle_url_resolves(self):
        """Test task toggle URL resolves correctly"""
        url = reverse('task_toggle', args=[1])
        self.assertEqual(url, '/toggle/1/')


class TaskWorkflowTest(TestCase):
    """Integration test for complete workflow"""
    
    def setUp(self):
        self.client = Client()
    
    def test_complete_task_workflow(self):
        """Test complete workflow: Create → Edit → Toggle → Delete"""
        # Create
        create_data = {
            'title': 'Workflow Task',
            'description': 'Test workflow',
            'due_date': '2025-12-31'
        }
        response = self.client.post(reverse('task_create'), create_data)
        self.assertEqual(response.status_code, 302)
        task = Task.objects.first()
        self.assertIsNotNone(task)
        
        # Edit
        update_data = {
            'title': 'Updated Workflow Task',
            'description': 'Updated description',
            'due_date': '2026-01-15'
        }
        response = self.client.post(reverse('task_update', args=[task.pk]), update_data)
        self.assertEqual(response.status_code, 302)
        task.refresh_from_db()
        self.assertEqual(task.title, 'Updated Workflow Task')
        
        # Toggle (mark as complete)
        response = self.client.post(reverse('task_toggle', args=[task.pk]))
        self.assertEqual(response.status_code, 302)
        task.refresh_from_db()
        self.assertTrue(task.completed)
        
        # Delete
        response = self.client.post(reverse('task_delete', args=[task.pk]))
        self.assertEqual(response.status_code, 302)
        self.assertEqual(Task.objects.count(), 0)

