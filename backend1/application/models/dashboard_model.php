<?php
class Dashboard_model extends CI_Model {

    function __construct()
    {
        // Call the Model constructor
        parent::__construct();
		
		
    }
	
    function addDashboard($title, $userid){
		if($userid == 0)
            return 0;
        $data = array(
                'title' => $title ,
                'userid' => $userid
             );
        if($this->db->insert('dashboards', $data)){
			$insertid = $this->db->insert_id();
			//$this->updateDashboard($insertid, "Dashboard" . $insertid, $userid);
			return $insertid;
		}
		else
			return 0;
	}
	
	function getDashboards($userid){
		$query = $this->db->get_where('dashboards', array('userid'=>$userid));
		$rows = array();
        foreach($query->result() as $row){
			$rows[] = $row;
		}
		return $rows;
	}
	
	function updateDashboard($id, $title, $userid){
		$data = array(
               'title' => $title,
               'userid' => $userid,
            );

		$this->db->where('id', $id);
		return $this->db->update('dashboards', $data); 
	}
	
	function saveDashboard($id, $userid, $widgets){
		$widgets = json_decode($widgets);
		$order = 0;
		foreach($widgets as $widget){
			if(isset($widget->settings))
				$settings = $widget->settings;
			else
				$settings = "";
			if(isset($widget->comparisons))
				$comparisons = $widget->comparisons;
			else
				$comparisons = "";
			if(isset($widget->data))
				$data = $widget->data;
			else	
				$data = "";
			if(isset($widget->style))
				$style = $widget->style;
			else
				$style = "";
			$order++;				
			$data = array(
				'title' => $widget->title,
				'name' => $widget->name,
				'settings' => $settings,
				'comparisons' => $comparisons,
				'data' => $data,
				'styles' => json_encode($style),
				'dashboardid' => $id,
				'order' => $order
			);
			$this->db->where('id', $widget->id);
			$this->db->update('widgets', $data);
		}
		return true;
	}
	
	function getDashboard($id){
		$query = $this->db->order_by("order", "asc")->get_where('widgets', array('dashboardid'=>$id));
		$rows = array();
        foreach($query->result() as $row){
			$rows[] = $row;
		}
		return $rows;
	}
	
	function deleteDashboard($id){
		// Remove all widgets belonging to the dashboard
		$this->db->where('dashboardid', $id);
		$this->db->delete('widgets'); 
		
		// Remove the dashboard itself
		$this->db->where('id', $id);
		$this->db->delete('dashboards'); 		
	}
	
	function shareDashboard($userid, $dashboardid, $recipient){
		try{
			$query = $this->db->get_where('dashboards', array('id'=>$dashboardid, 'userid'=>$userid));
			if($query->num_rows() == 0){
				return 0;
			}else{	
				$result = $query->result();
				
				$dashboard_title = $result[0]->title;
				$ci =& get_instance();
				$ci->load->model('User_model');
				
				// Check if recipient's gmail is registered in the users table
				$bExists = $ci->User_model->checkUser($recipient);
				$recipient_userid = $ci->User_model->updateUser($recipient);
				$newdashboard_id = $this->addDashboard($dashboard_title, $recipient_userid);
				$widgets = $this->getDashboard($dashboardid);
				foreach($widgets as $widget){					
					$data = array(
						'title' => $widget->title,
						'name' => $widget->name,
						'settings' => $widget->settings,
						'styles' => $widget->styles,
						'comparisons' => $widget->comparisons,
						'data' => $widget->data,
						'dashboardid' => $newdashboard_id
					);
					$this->db->insert('widgets', $data);
				} 
				
				return 1;				
			}
		}catch(Exception $e){
			var_dump($e);
		}
	}
	
	function clearDashboard($dashboardid, $userid){
		$query = $this->db->get_where('dashboards', array('id'=>$dashboardid, 'userid'=>$userid));
		if($query->num_rows() == 0){
			return 0;
		}else{	
			$this->db->where('dashboardid', $dashboardid);
			$this->db->delete('widgets'); 
		}
	}
}

?>