"""uniliv_project/urls.py"""
from django.contrib import admin
from django.urls    import path, include
from dashboard      import views

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),

    # Auth
    path('api/auth/login/',  views.api_login,  name='login'),
    path('api/auth/logout/', views.api_logout, name='logout'),
    path('api/auth/me/',     views.api_me,     name='me'),

    # Dashboard API — dishes + menu (prefixed with /api/)
    path('api/', include('dashboard.urls')),
]
