# api/management/commands/createsu.py

import os
from django.core.management.base import BaseCommand
from api.models import User # Make sure to import your custom User model

class Command(BaseCommand):
    """
    Creates a superuser if one does not exist.
    Reads credentials from environment variables.
    """
    def handle(self, *args, **options):
        username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL')

        if not User.objects.filter(username=username).exists():
            self.stdout.write(f'Creating account for {username}')
            User.objects.create_superuser(
                email=email,
                username=username,
                password=password
            )
            self.stdout.write('Superuser created successfully!')
        else:
            self.stdout.write('Superuser already exists. Skipping.')