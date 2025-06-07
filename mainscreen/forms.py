from django import forms
from django.contrib.auth.models import User

class TeacherSignupForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password']

    def __init__(self, *args, **kwargs):
        super(TeacherSignupForm, self).__init__(*args, **kwargs)
        # Make additional fields required
        self.fields['username'].required = True
        self.fields['email'].required = True
        self.fields['first_name'].required = True
        self.fields['last_name'].required = True