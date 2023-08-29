"# UploadGG" 

1. Run at terminal: git clone https://github.com/etasycandy/UploadGG.git
2. Run at terminal: cd UploadGG
3. Run at terminal: code .
4. Get the file containing the key of googleapis:
   - Visit this website address: https://tradacongnghe.com/2023/06/29/huong-dan-upload-file-vao-google-drive-su-dung-nodejs/
   - Please complete the 5th step to get the file "credentials.json".
   - Save file "credentials.json" in the folder containing your code.
5. Back to Vscode and create a file ".env".
6. Copy the contents of file ".env.example" and paste it into the file ".env".
7. Reconfigure file ".env":
   - At the lines: 2, 5, 9, 11, 14. Fill in the alternative content similar to the example.
   - At the lines: 17, 18. Must not be changed.
   - At the lines: 21.
        + Access your google drive -> Create a folder -> Share with everyone (note: share with editing permission) 
          -> Get the id of that folder.
        + Example: Folder share link is: https://drive.google.com/drive/folders/1kX0Ok5lauXb2H_JtWhZgWERqSC4_yiuy?usp=drive_link
        + "**1kX0Ok5lauXb2H_JtWhZgWERqSC4_yiuy**" is the folder id.
        + Copy the folder id and paste it on line 21.
8. Run at terminal: yarn
9. Run at terminal: yarn run dev

=> Access the address: http://localhost:8000/
