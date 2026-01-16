import random
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils.timezone import now

from emails.models import Email
from scanner.models import ScanLog

User = get_user_model()


class Command(BaseCommand):
    help = "Seed large realistic dataset for backend + frontend testing"

    def handle(self, *args, **options):
        self.stdout.write("🌱 Seeding LARGE database...")

        # -------------------------
        # RESET DATA (DEV ONLY)
        # -------------------------
        Email.objects.all().delete()
        ScanLog.objects.all().delete()
        User.objects.exclude(is_superuser=True).delete()

        # -------------------------
        # USERS
        # -------------------------
        admin, _ = User.objects.get_or_create(
            username="admin_user",
            defaults={
                "email": "admin@test.com",
                "role": "admin",
                "is_staff": True,
                "is_superuser": True,
            },
        )
        admin.set_password("admin123")
        admin.save()

        users = []
        for i in range(1, 6):
            u, _ = User.objects.get_or_create(
                username=f"user{i}",
                defaults={
                    "email": f"user{i}@test.com",
                    "role": "user",
                },
            )
            u.set_password("password123")
            u.save()
            users.append(u)

        self.stdout.write("👥 Users created")

        # -------------------------
        # EMAIL GENERATION
        # -------------------------
        SUBJECTS = [
            "Invoice update",
            "Meeting reminder",
            "Security alert",
            "Welcome!",
            "Action required",
            "Weekly report",
        ]

        BODIES = [
            "Please review the attached document.",
            "This is an automated notification.",
            "Let me know your availability.",
            "Urgent: immediate attention required.",
            "Everything looks good on our side.",
        ]

        emails_created = 0

        for user in users:
            # SENT emails
            for _ in range(50):
                recipient = random.choice(users).email
                created_at = now() - timedelta(days=random.randint(0, 30))

                email = Email.objects.create(
                    user=user,
                    sender=user.email,
                    recipient=recipient,
                    subject=random.choice(SUBJECTS),
                    body=random.choice(BODIES),
                    folder="sent",
                    is_outgoing=True,
                    created_at=created_at,
                )

                self._create_scan(email, user)
                emails_created += 1

            # INBOX emails
            for _ in range(50):
                sender = random.choice(users).email
                created_at = now() - timedelta(days=random.randint(0, 30))

                email = Email.objects.create(
                    user=user,
                    sender=sender,
                    recipient=user.email,
                    subject=random.choice(SUBJECTS),
                    body=random.choice(BODIES),
                    folder="inbox",
                    is_outgoing=False,
                    created_at=created_at,
                )

                self._create_scan(email, user)
                emails_created += 1

        self.stdout.write(self.style.SUCCESS(
            f"✅ Seed complete: {emails_created} emails created"
        ))

    # -------------------------
    # SCAN LOGS
    # -------------------------
    def _create_scan(self, email, user):
        malicious = random.random() < 0.25  # 25% malicious
        ScanLog.objects.create(
            email=email,
            user=user,
            result="malicious" if malicious else "safe",
            confidence=round(random.uniform(0.6, 0.99), 2),
        )
<<<<<<< HEAD
=======

>>>>>>> 3d965ce55f99ca93296ea953c0544f389ec92aa1
