# Generated by Django 5.2.2 on 2025-07-13 09:41

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_banner'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='orderitem',
            options={'ordering': ['date_added']},
        ),
    ]
