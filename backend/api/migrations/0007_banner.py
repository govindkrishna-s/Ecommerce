# Generated by Django 5.2.2 on 2025-07-11 16:13

import cloudinary.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_alter_product_image'),
    ]

    operations = [
        migrations.CreateModel(
            name='Banner',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(help_text='homepage-banner', max_length=100, unique=True)),
                ('image', cloudinary.models.CloudinaryField(max_length=255, verbose_name='banner_image')),
                ('alt_text', models.CharField(default='E-commerce banner', max_length=200)),
            ],
        ),
    ]
