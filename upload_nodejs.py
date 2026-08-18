import ftplib
import os
import sys

FTP_HOST = "195.35.38.244"
FTP_USER = "u272603187"
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
    
    # Upload Node server files
    upload_file(ftp, 'server.js', 'server.js')
    
    print("All files uploaded successfully!")
    
    # Try touching tmp/restart.txt to reload Passenger Node.js app
    try:
        ftp.mkd('tmp')
    except:
        pass
    try:
        with open('restart.txt', 'w') as f:
            f.write('restart')
        with open('restart.txt', 'rb') as f:
            ftp.storbinary('STOR tmp/restart.txt', f)
        os.remove('restart.txt')
        print("Triggered Passenger restart")
    except Exception as e:
        print("Could not trigger restart:", e)

    ftp.quit()

if __name__ == "__main__":
    main()
