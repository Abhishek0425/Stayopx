from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [('dashboard', '0001_initial')]
    operations = [
        migrations.CreateModel(
            name='ScheduledMeal',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ('brand', models.CharField(max_length=20, choices=[('uniliv','UNILIV'),('huddle','HUDDLE')])),
                ('week_number', models.PositiveSmallIntegerField(help_text='1-4 (each sheet in Excel)')),
                ('day_of_week', models.CharField(max_length=10,
                    choices=[('Monday','Monday'),('Tuesday','Tuesday'),('Wednesday','Wednesday'),
                             ('Thursday','Thursday'),('Friday','Friday'),
                             ('Saturday','Saturday'),('Sunday','Sunday')])),
                ('breakfast1', models.CharField(max_length=200, blank=True, null=True)),
                ('breakfast2', models.CharField(max_length=200, blank=True, null=True)),
                ('lunch_dal',  models.CharField(max_length=200, blank=True, null=True)),
                ('lunch_veg1', models.CharField(max_length=200, blank=True, null=True)),
                ('lunch_veg2', models.CharField(max_length=200, blank=True, null=True)),
                ('snack',      models.CharField(max_length=200, blank=True, null=True)),
                ('dinner_dal', models.CharField(max_length=200, blank=True, null=True)),
                ('dinner_veg1',models.CharField(max_length=200, blank=True, null=True)),
                ('dinner_veg2',models.CharField(max_length=200, blank=True, null=True)),
            ],
            options={'ordering': ['brand','week_number','day_of_week'],
                     'unique_together': {('brand','week_number','day_of_week')}},
        ),
    ]
