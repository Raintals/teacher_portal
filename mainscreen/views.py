from django.shortcuts import render
from django.shortcuts import redirect
from django.contrib.auth.views import LoginView, LogoutView
from django.urls import reverse_lazy
from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic.edit import FormView
from django.contrib.auth.hashers import make_password
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib import messages
from mainscreen.forms import TeacherSignupForm, EditProfileForm
from mainscreen.models import Student
import json


class Index(TemplateView):
    template_name = 'mainscreen/index.html'

    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect('mainscreen:home')  # Redirect to dashboard if logged in
        return super().get(request, *args, **kwargs)


class TeacherLoginView(LoginView):
    template_name = 'mainscreen/login.html'
    redirect_authenticated_user = True

    def get_success_url(self):
        return reverse_lazy('mainscreen:home')

class TeacherSignupView(FormView):
    template_name = 'mainscreen/signup.html'
    form_class = TeacherSignupForm
    success_url = reverse_lazy('mainscreen:login')
    
    def form_valid(self, form):
        user = form.save(commit=False)
        # Hash the password before saving
        user.password = make_password(form.cleaned_data['password'])
        user.save()
        return super().form_valid(form)

class TeacherEditProfileView(LoginRequiredMixin, FormView):
    template_name = 'mainscreen/edit_profile.html'
    form_class = EditProfileForm
    login_url = reverse_lazy('mainscreen:login')

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        user_id = self.kwargs.get("user_id")
        # Use current user if not matching
        kwargs['instance'] = self.request.user
        return kwargs
    
    def get_success_url(self):
        return reverse_lazy('mainscreen:edit_profile', args=[self.request.user.pk])

    def form_valid(self, form):
        user = form.save(commit=False)
        # Update password if provided (optional)
        if form.cleaned_data.get('password'):
            user.password = make_password(form.cleaned_data['password'])
        user.save()
        messages.success(self.request, "Your profile has been updated successfully.")
        return super().form_valid(form)

class Dashboard(LoginRequiredMixin, TemplateView):
    template_name = 'mainscreen/dashboard.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['students'] = Student.objects.all()
        return context

class TeacherLogoutView(LogoutView):
    next_page = reverse_lazy('mainscreen:login')  # Redirect to login page after logout

@csrf_exempt
def update_student(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        student = Student.objects.get(id=data['id'])
        student.name = data['name']
        student.subject = data['subject']
        student.marks = data['marks']
        student.save()
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'failed'}, status=400)

@csrf_exempt
def add_student(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        name = data.get('name', '').strip().title()
        subject = data.get('subject', '').strip().title()
        try:
            new_marks = int(data.get('marks', 0))
        except ValueError:
            new_marks = 0

        try:
            student = Student.objects.get(name=name, subject=subject)
            student.marks = new_marks
            student.save()
            action = 'updated'
        except Student.DoesNotExist:
            student = Student.objects.create(name=name, subject=subject, marks=new_marks)
            action = 'created'
        return JsonResponse({
            'status': 'success',
            'action': action,
            'id': student.pk,
            'name': student.name,
            'subject': student.subject,
            'marks': student.marks
        })
    return JsonResponse({'status': 'failed'}, status=400)

@csrf_exempt
def delete_student(request, student_id):
    if request.method == 'POST':
        Student.objects.filter(id=student_id)
        print(f"Deleting student with ID: {student_id}")
        return JsonResponse({'status': 'deleted'})
    return JsonResponse({'status': 'failed'}, status=400)