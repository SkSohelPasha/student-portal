from app import create_app
from backend.models import db, Attendance
from datetime import datetime
from sqlalchemy import func

app = create_app()

def cleanup_duplicates():
    with app.app_context():
        print("Starting attendance cleanup...")
        
        # We find all records and group them by student, course, and date
        # Since SQLite's DATE() function is available via func.date
        all_records = Attendance.query.all()
        
        # Use a dict to track seen combinations: (student_id, course_id, date_str) -> record_id
        seen = {}
        ids_to_delete = []
        
        for r in all_records:
            date_str = r.date.strftime('%Y-%m-%d')
            key = (r.student_id, r.course_id, date_str)
            
            if key in seen:
                # Duplicate found! We'll keep the one with the higher ID (assuming it's newer)
                # or just delete this one if the one we've seen is already in the kept list
                old_id = seen[key]
                if r.id > old_id:
                    ids_to_delete.append(old_id)
                    seen[key] = r.id
                    print(f"Found duplicate for {key}. Keeping ID {r.id}, marking ID {old_id} for deletion.")
                else:
                    ids_to_delete.append(r.id)
                    print(f"Found duplicate for {key}. Keeping ID {old_id}, marking ID {r.id} for deletion.")
            else:
                seen[key] = r.id
        
        if not ids_to_delete:
            print("No duplicates found.")
            return

        print(f"Deleting {len(ids_to_delete)} duplicate records...")
        Attendance.query.filter(Attendance.id.in_(ids_to_delete)).delete(synchronize_session=False)
        db.session.commit()
        print("Cleanup complete!")

if __name__ == "__main__":
    cleanup_duplicates()
