<?php
	include("header.php");
	global $conn;
	header("content-type:application/json");
	$email = $_POST['email'];
	$sql = "select id from users where email='" . $email. "'";
	$result = mysqli_query($conn, $sql);
	$row = mysqli_fetch_array($result);
	if($row){
		$userid = $row['id'];
	}else{
		$sql = "Insert into users(email, name, picture) values('". $email. "', '', '')";
		mysqli_query($conn, $sql);
		$userid = mysqli_insert_id($conn);
	}
	$arr = array();
	$arr['userid'] = $userid;
	echo json_encode($arr);	
?>