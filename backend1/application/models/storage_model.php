<?php
class Storage_model extends CI_Model {

    function __construct()
    {
        // Call the Model constructor
        parent::__construct();
		
		
    }
	/*
		* Share dashboard with other users (with gmail)
		* function share
		* params
			@userid : userid (owner of dashboard)
			@dashboardid : storage id 
			@recipient : gmail address of the recipient
		* return
			1 on success, 0 on failure
			
	*/
    function share($userid, $dashboardid, $recipient){
		try{
			$query = $this->db->get_where('storages', array('name'=>'storage' . $dashboardid, 'userid'=>$userid));
			if($query->num_rows() == 0){
				return 0;
			}else{	
				$result = $query->result();
				$storage = $result[0]->value;

				$dashboard_title = $this->getTitle($userid, $dashboardid);
				$ci =& get_instance();
				$ci->load->model('User_model');

				// Check if recipient's gmail is registered in the users table
				$bExists = $ci->User_model->checkUser($recipient);
				$recipient_userid = $ci->User_model->updateUser($recipient);
				if($bExists == 0){
					/* If the user is not registered
						  * create a new entry in user table
						  * add ngStorage-dashboards and ngStorage-maxNumber in storages table
					*/
					$ngDashboards = array(
						'userid' => $recipient_userid ,
						'name' => 'ngStorage-dashboards' ,
						'value' => '[{"title":"' . $dashboard_title . '","id":1}]'
					 );
					$this->db->insert('storages', $ngDashboards);    
					$ngStorageMaxNumber = array(
						'userid' => $recipient_userid ,
						'name' => 'ngStorage-maxNumber' ,
						'value' => '1'
					 );
					$this->db->insert('storages', $ngStorageMaxNumber);  
					$storageIndex = 1;
				}else{
					/*
						If the user is already registered
							* add a new dashboard in ngStorage-dashboards
							* increase ngStorage-maxNumber 
					*/
					$storageIndex = $this->incMaxSotrageNum($recipient_userid);
										
					$query = $this->db->get_where('storages', array('name'=>'ngStorage-dashboards', 'userid'=>$recipient_userid));
					if($query->num_rows() == 0){
						$ngDashboards = array(
							'userid' => $recipient_userid ,
							'name' => 'ngStorage-dashboards' ,
							'value' => '[{"title":"' . $dashboard_title . '","id":1}]'
						 );
						$this->db->insert('storages', $ngDashboards);    
						$ngStorageMaxNumber = array(
							'userid' => $recipient_userid ,
							'name' => 'ngStorage-maxNumber' ,
							'value' => '1'
						 );
						$this->db->insert('storages', $ngStorageMaxNumber); 
					}else{
						$result = $query->result();
						$recipient_storage = $result[0]->value;
						$dashboards_arr = json_decode($recipient_storage);
						$new_dashboard = array(
							"title" => $dashboard_title,
							"id" => $storageIndex
						);
						$dashboards_arr[] = $new_dashboard;
						$this->db->query("update storages set value = '" . json_encode($dashboards_arr). "' where userid = " . $recipient_userid . " and name = 'ngStorage-dashboards'");
					}
				}	
				// Save the dashboard's data as a new storage
				$storage_data = array(
					'userid' => $recipient_userid,
					'name' => 'storage' . $storageIndex,
					'value' => $storage
				);
				$this->db->insert('storages', $storage_data);
				return 1;				
			}
		}catch(Exception $e){
			var_dump($e);
		}
	}
	/*
		Get the title of dashboard
		@params
			userid : user id of dashboard's owner
			dashboardid : sequential number of dashboards within the user's dashboards
	*/
	function getTitle($userid, $dashboardid){
		$query = $this->db->get_where('storages', array('name'=>'ngStorage-dashboards', 'userid'=>$userid));
        if($query->num_rows() == 0){
            return "Unknown Dashboard";
        }else{
			$result = $query->result();
			$value = $result[0]->value;
			$dashboard_arr = json_decode($value);
			foreach($dashboard_arr as $dashboard){
				if($dashboard->id == $dashboardid){
					return $dashboard->title;
				}
			}
		}
		return "Unknown Dashboard";
	}
	
	function getMaxStorageNumber($userid){
		$query = $this->db->get_where('storages', array('name'=>'ngStorage-maxNumber', 'userid'=>$userid));
        if($query->num_rows() == 0){
            return 0;
        }else{
			$result = $query->result();
			return $result[0]->value;
		}
	}
	
	function incMaxSotrageNum($userid){
		$query = $this->db->get_where('storages', array('name'=>'ngStorage-maxNumber', 'userid'=>$userid));
		if($query->num_rows() == 0){
            $data = array(
				'userid' => $userid,
				'name' => 'ngStorage-maxNumber',
				'value' => 1
			);
			$this->db->insert('storages', $data);
			return 1;
        }
		$result = $query->result();
		$this->db->query("update storages set value = value + 1 where userid = " . $userid . " and name='ngStorage-maxNumber'");
		return ($result[0]->value + 1);
	}
}

?>