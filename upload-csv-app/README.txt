README.txt

FrontEnd: React Typescript
BackEnd: Express.js
Database: PostgreSQL

1. Upload a CSV file
	- If successful, table will be diaplayed
	- If fails, "Upload Failed" will be displayed
	- Stores data into the database.

2. Table displays 20 rows per page.

3. Search bar searches the NAME, EMAIL and BODY fields.

4. 
	Duplicate case:
		Checks if ID exists, if it does then it'll check if the contents are the same.
		If they are, the exisitng row will be highlighted in RED and the new record will not be inserted.
	Conflict case:
		Checks if ID exists, if it does then it'll check if the contents are the same.
		If contents are not the same, the exisiting row will be highlighted in YELLOW and the new record will not be inserted.
