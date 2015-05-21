<?php
class User_model extends CI_Model {

    function __construct()
    {
        // Call the Model constructor
        parent::__construct();
		
		
    }
	
    function updateUser($email, $name = "", $picture = "")
    {
        if($email == "")
            return 0;
        $query = $this->db->get_where('users', array('email'=>$email));
		$data = array(
                'email' => $email ,
                'name' => $name ,
                'picture' => $picture
             );		
        if($query->num_rows() == 0){           
            $this->db->insert('users', $data);          
			return $this->db->insert_id();
        }else{
			$result = $query->result();		
			/**
				Temporary Action for saving the names and pictures which are not set.
			*/
			$this->db->where('email', $email);			
			$this->db->update('users', $data);             
            return $result[0]->id;
        }
    }
	
	/*
		function checkUser()
		@description
			Check if the email is registered in the database
		@params
			$email : the email which should be checked upon
		@return	
			1 : exists, 0 : not
				
	*/
	function checkUser($email){
		if($email == "")
			return 0;
		$query = $this->db->get_where('users', array('email'=>$email));
        if($query->num_rows() == 0){
            return 0;
        }else{
            return 1;
        }
	}
	
	function getUserDetail($userid){
		$query = $this->db->get_where('users', array('id'=>$userid));
        if($query->num_rows() == 0){
			return null;
        }else{
            $result = $query->result();
            $row = $result[0];
			return $row;
        } 
	}
	
	function getAllUsers(){
		$query = $this->db->get('users');
		/* $users = array();
		foreach ($query->result() as $row)
		{
			$user = array(
				'email' => $row->email,
				'name' => $row->name
			);
			$users[] = $user;
		}
		return $users; */
		return $query->result();
	}	
}

?>