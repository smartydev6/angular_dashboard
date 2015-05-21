<?php
	include("header.php");
	global $conn;
	$userid = $_POST['userid'];
	$name = $_POST['name'];
	$value = $_POST['value'];
	$sql = "select * from storages where userid=" . $userid . " and name='" . $name . "'";
	$result = mysqli_query($conn, $sql); 
	$row = mysqli_fetch_row($result);
	if($row){
		$update_query = "update storages set value='" . $value . "' where userid= " . $userid . " and name='" . $name ."'";
		mysqli_query($conn, $update_query);
		$status = "updated";
	}else{
		$insert_query = "insert into storages(userid, name, value) values(" . $userid . ", '" . $name . "', '" . $value . "')";
		mysqli_query($conn, $insert_query);
		$status = "inserted";
	}
	echo $status;
?>