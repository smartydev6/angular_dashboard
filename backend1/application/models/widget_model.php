<?php
class Widget_model extends CI_Model {

    function __construct()
    {
        // Call the Model constructor
        parent::__construct();
		
		
    }
	
    function addWidget($title, $name, $dashboardid){
		if($dashboardid == 0 || $name == "")
            return 0;
        $data = array(
                'title' => $title ,
                'name' => $name,
				'dashboardid' => $dashboardid
             );
        if($this->db->insert('widgets', $data)){
			$insertid = $this->db->insert_id();
			return $insertid;
		}
		else
			return 0;
	}

	function updateWidget($id, $title, $settings, $comparisons, $data, $dispprefer){
		$data = array(
			'title' => $title, 
            'settings' => $settings,
			'comparisons' => $comparisons,
			'data' => $data,
			'dispprefer' => $dispprefer
	   );

		$this->db->where('id', $id);
		return $this->db->update('widgets', $data); 
	}
	
	function deleteWidget($id){
		$this->db->where('id', $id);
		return $this->db->delete('widgets'); 		
	}
	
}

?>