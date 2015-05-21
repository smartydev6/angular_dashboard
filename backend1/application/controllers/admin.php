<?php defined('BASEPATH') OR exit('No direct script access allowed');

// This can be removed if you use __autoload() in config.php OR use Modular Extensions
require APPPATH.'/libraries/REST_Controller.php';

class admin extends REST_Controller
{
	function __construct()
    {
        // Construct our parent class
        parent::__construct();
        
        // Configure limits on our controller methods. Ensure
        // you have created the 'limits' table and enabled 'limits'
        // within application/config/rest.php
        $this->methods['user_get']['limit'] = 500; //500 requests per hour per user/key
        $this->methods['user_post']['limit'] = 100; //100 requests per hour per user/key
        $this->methods['user_delete']['limit'] = 50; //50 requests per hour per user/key
        $this->load->database();        
        $this->load->model('User_model');
        $this->load->model('Log_model');
		$this->load->model('Storage_model'); 
		$this->load->model('Dashboard_model');
		$this->load->model('Widget_model');
    }
	
    function users_get(){	
		$this->response(array('users' => $this->User_model->getAllUsers()), 200); 
	}
	
	function logs_get(){
		$this->response(array('logs' => $this->Log_model->getAllLogs()), 200);
	}
	
	function verify_post(){
		$username = $this->post('username');
		$password = $this->post('password');
		if((strtolower($username) == "admin" || strtolower($username) == "kalle@superanalytics.fi") && ($password=="A7182E-GCB"))
			$this->response(array("success"=>1), 200);
		else
			$this->response(array("success"=>0), 200);
	}
}