CREATE TABLE tbl_data (
    postId int,
    id int PRIMARY KEY,
    name varchar(500),
    email varchar(100),
    body varchar(500),
	duplicateId int null,
	conflictId int null
);
