<?php
	include("header.php");
	global $conn;
	header("content-type:application/json");	
	$userid = $_POST['userid'];
	$sql = "select * from storages where userid=" . $userid;
	$result = mysqli_query($conn, $sql); 
	$storage = [];
	while($row = mysqli_fetch_array($result)){
		$storage[$row['name']] = $row['value'];
	}
	echo json_encode($storage);
?>