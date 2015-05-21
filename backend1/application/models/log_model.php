<?php
class Log_model extends CI_Model {

    function __construct()
    {
        // Call the Model constructor
        parent::__construct();
		
		
    }
	
    function addLog($userid)
    {
        /* Add an entry into the logs table
         * 
         *  userid : $userid
         *  time   : Now
         */
        $data = array(
            'userid' => $userid ,
            'logtime' => date("Y-m-d h:i:s")
         );
        return $this->db->insert('logs', $data);       
    }
	
	function getAllLogs(){
		$this->db->select("*");
		$this->db->from("users");
		$this->db->join("logs", "users.id = logs.userid");
		$query = $this->db->get();
		$rows = [];
        foreach($query->result() as $row){
			$rows[] = $row;
		}
		return $rows;
	}
}

?>