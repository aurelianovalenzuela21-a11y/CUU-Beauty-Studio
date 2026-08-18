import ftplib
import os

FTP_HOST = "195.35.38.244"
FTP_USER = "u272603187.cuubeauty.com"
FTP_PASS = "Provicional21?"

def upload_file(ftp, file_path, target_path):
    print(f"Uploading {file_path} to {target_path}...")
    with open(file_path, 'rb') as f:
        ftp.storbinary(f'STOR {target_path}', f)

def upload_dir(ftp, local_dir, remote_dir):
    try:
        ftp.mkd(remote_dir)
    except:
        pass
    for item in os.listdir(local_dir):
        if item in ['.DS_Store']:
            continue
        local_path = os.path.join(local_dir, item)
        remote_path = f"{remote_dir}/{item}"
        if os.path.isfile(local_path):
            upload_file(ftp, local_path, remote_path)
        elif os.path.isdir(local_path):
            upload_dir(ftp, local_path, remote_path)

def main():
    ftp = ftplib.FTP(FTP_HOST)
    ftp.login(FTP_USER, FTP_PASS)
    
    # Optional: Delete old index.html and .php to avoid confusion
    try: ftp.delete('index.html')
    except: pass
    try: ftp.delete('get-availability.php')
    except: pass

    # Upload Node server files
    upload_file(ftp, 'server.js', 'server.js')
    upload_file(ftp, 'package.json', 'package.json')
    upload_file(ftp, 'package-lock.json', 'package-lock.json')

    # Upload dist folder
    upload_dir(ftp, 'dist', 'dist')
    
    print("All files uploaded successfully!")
    ftp.quit()

if __name__ == "__main__":
    main()
