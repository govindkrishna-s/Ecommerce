# Generated by Django 5.2.2 on 2025-07-04 12:54

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_alter_order_customer_alter_shippingaddress_customer_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='date_ordered',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
    ]
