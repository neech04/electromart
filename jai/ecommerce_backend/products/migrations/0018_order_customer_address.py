# Generated by Django 5.1.6 on 2025-03-26 18:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0017_alter_order_options_order_customer_email_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='customer_address',
            field=models.TextField(blank=True, help_text="Customer's shipping address at the time of order", null=True),
        ),
    ]
