from django.urls import path
from mainscreen.views import TeacherLoginView, Dashboard, TeacherLogoutView, TeacherSignupView, TeacherEditProfileView, Index, update_student, add_student, delete_student

urlpatterns = [
    path('', Index.as_view(), name='index'),  # Redirect to dashboard on root URL
    path('login/', TeacherLoginView.as_view(),name='login'),
    path('signup/', TeacherSignupView.as_view(), name='signup'),
    path('logout/', TeacherLogoutView.as_view(), name='logout'),
    path('edit-profile/<int:user_id>', TeacherEditProfileView.as_view(), name='edit_profile'),
    path('dashboard/', Dashboard.as_view(), name='home'),
    path('update-student/', update_student, name='update_student'),
    path('add-student/', add_student, name='add_student'),
    path('delete-student/<int:student_id>/', delete_student, name='delete_student'),
]
