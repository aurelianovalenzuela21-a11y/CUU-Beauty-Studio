import os
import ftplib
import sys

FTP_HOST = os.environ.get("CUU_FTP_HOST", "195.35.38.244")
FTP_USER = os.environ["CUU_FTP_USER"]
FTP_PASS = os.environ["CUU_FTP_PASS"]

LOCAL_DIR = os.environ.get("CUU_LOCAL_DIR", os.path.join(os.path.dirname(__file__), "dist"))
REMOTE_DIR = "public_html" # typically it's /public_html or public_html

def upload_dir(ftp, local_dir, remote_dir):
    print(f"Entering local: {local_dir}")
    try:
        ftp.cwd(remote_dir)
        print(f"Changed to remote: {remote_dir}")
    except ftplib.error_perm:
        try:
            ftp.mkd(remote_dir)
            ftp.cwd(remote_dir)
            print(f"Created and changed to remote: {remote_dir}")
        except Exception as e:
            print(f"Failed to create/cwd to {remote_dir}: {e}")
            return

    for item in os.listdir(local_dir):
        if item in ['.DS_Store']: continue
        local_path = os.path.join(local_dir, item)
        if os.path.isfile(local_path):
            print(f"Uploading file: {item}")
            with open(local_path, 'rb') as f:
                ftp.storbinary(f'STOR {item}', f)
        elif os.path.isdir(local_path):
            print(f"Directory found: {item}")
            upload_dir(ftp, local_path, item)
            ftp.cwd("..")

def main():
    print("Connecting to FTP...")
    ftp = ftplib.FTP()
    
    # Try logging in
    try:
        ftp.connect(FTP_HOST, 21, timeout=10)
        ftp.login(FTP_USER, FTP_PASS)
        print("Logged in successfully with full username.")
    except ftplib.error_perm:
        print("Login failed with full string, trying just the u-number...")
        short_user = FTP_USER.split('.')[0]
        try:
            ftp.connect(FTP_HOST, 21, timeout=10)
            ftp.login(short_user, FTP_PASS)
            print("Logged in successfully with short username.")
        except Exception as e:
            print(f"Failed to login: {e}")
            sys.exit(1)
    except Exception as e:
         print(f"Connection failed: {e}")
         sys.exit(1)

    print("Connected!")
    
    # Check if we need to enter public_html
    try:
        ftp.cwd("public_html")
        print("Moved into public_html")
    except Exception as e:
        print(f"Could not cwd to public_html, maybe we are already there? {e}")

    # Optionally clean the directory? Maybe risky, let's just overwrite for now.
    
    upload_dir(ftp, LOCAL_DIR, ".")
    ftp.quit()
    print("Upload complete!")

if __name__ == "__main__":
    main()
