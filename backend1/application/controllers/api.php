<?php defined('BASEPATH') OR exit('No direct script access allowed');

// This can be removed if you use __autoload() in config.php OR use Modular Extensions
require APPPATH.'/libraries/REST_Controller.php';

class api extends REST_Controller
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
    function user_post()
    {
        $userid = $this->User_model->updateUser($this->post('email'), $this->post('name'), $this->post('picture'));
        if($userid>0)
            $this->Log_model->addLog($userid);
        $this->response(array('userid'=>$userid), 200);
    }  
    
	function dashboard_post()
	{
		if($this->post('action') == "share"){
			// Case for sharing dashboard_post
			$userid = $this->post('userid');
			$dashboardid = $this->post('dashboardid');
			$recipient = $this->post('recipient');
			$success = $this->Dashboard_model->shareDashboard($userid, $dashboardid, $recipient);
			$this->response(array('result'=>$success), 200);
			/* if($success == 1){
				$msg = "Dear User, Your friend has shared a Dashboard with you. <br/>
						Please <a href='http://superbrain.io'>login</a> with your Google Analytics email address to view the Dashboard, <br/>
					if you do not have the shared Google Analytics profiles and segments please choose one from your list of accounts and profiles.";
				$this->load->library('email');
				$config['protocol'] = 'sendmail';
				$config['mailpath'] = '/usr/sbin/sendmail';
				$config['charset'] = 'iso-8859-1';
				$config['mailtype'] = 'html'; 				
				$config['wordwrap'] = TRUE;

				$this->email->initialize($config);
				$this->email->from("no-reply@superbrain.io");
				$this->email->to($recipient); 
				
				$this->email->subject('SuperBrain Dashboard has been shared with you.');
				$this->email->message($msg);	

				$this->email->send();

				echo $this->email->print_debugger();
			}  */
		}
		
		if($this->post('action') == "new"){
			$userid = $this->post('userid');
			$title = $this->post('title');
			$dashboardid = $this->Dashboard_model->addDashboard($title, $userid);			
			if($dashboardid>0){
				$dashboard = array('id' => "$dashboardid",
									'userid' => $userid,
								   'title' => $title);
				$this->response(array('dashboard' => $dashboard), 200);
			}
			else
				$this->response(array('error' => 'Error while creating the dashboard'), 404);
		}
		
		if($this->post('action') == "update"){
			/*
				* Update dashboard's info such as title 
			*/
			
			$dashboardid = $this->post('id');
			$userid = $this->post('userid');
			$title = $this->post('title');
			$result = $this->Dashboard_model->updateDashboard($dashboardid, $title, $userid);			
			$this->response(array('result'=>$result), 200);
			
		}
		
		if($this->post('action') == "save"){
			/*
				* Save the dashboard's widgets
			*/
			$dashboardid = $this->post('id');
			$userid = $this->post('userid');
			$widgets = $this->post('widgets');
			$result = $this->Dashboard_model->saveDashboard($dashboardid, $userid, $widgets);			
			$this->response(array('result'=>$result), 200);
		}
		
		if($this->post('action') == "clear"){
			$dashboardid = $this->post('id');
			$userid = $this->post('userid');
			$this->Dashboard_model->clearDashboard($dashboardid, $userid);
		}
	}
	

	
	function dashboards_get(){
		$userid = $this->get('userid');
		$dashboards = $this->Dashboard_model->getDashboards($userid);
		$this->response(array("dashboards"=>$dashboards), 200);
	}
	
	function dashboard_delete(){
		$id = $this->delete('id');
		$result = $this->Dashboard_model->deleteDashboard($id);
		$this->response(array('result'=>$result), 200);				
	}
	
	function dashboard_get(){
		$id = $this->get('id');
		$widgets = $this->Dashboard_model->getDashboard($id);
		$widgets_wrapper = array();
		$widgets_wrapper['widgets'] = $widgets;
		$this->response($widgets_wrapper, 200);		
	}
	
	function widget_put(){
		$title = $this->put('title');
		$name = $this->put('name');
		$dashboardid = $this->put('dashboardid');		
		$widgetid = $this->Widget_model->addWidget($title, $name,  $dashboardid);
		if($widgetid>0)
			$this->response(array('widgetid' => $widgetid), 200);
		else
			$this->response(array('error' => 'Error while creating the widget'), 404);
	}
	
	function widget_post(){
		$id = $this->post('id');
		$title = $this->post('title');
		$settings = $this->post('settings');	
		$comparisons = $this->post('comparisons');
		$data = $this->post('data');
		$dispprefer = $this->post('dispprefer');
		$result = $this->Widget_model->updateWidget($id, $title, $settings, $comparisons, $data, $dispprefer);
		$this->response(array('result'=>$result), 200);
	}
	
	function widget_delete(){
		$id = $this->delete('id');
		$result = $this->Widget_model->deleteWidget($id);
		$this->response(array('result'=>$result), 200);		
	}
	function mail_get(){
		
		$msg = "Dear User, Your friend has shared a Dashboard with you. <br/>Please <a href='http://superbrain.io'>login</a> with your Google Analytics email address to view the Dashboard, <br/> if you do not have the shared Google Analytics profiles and segments please choose one from your list of accounts and profiles.";

		$this->load->library('email');
		$config['protocol'] = 'sendmail';
		$config['mailpath'] = '/usr/sbin/sendmail';
		$config['charset'] = 'iso-8859-1';
		$config['mailtype'] = 'html'; 				
		$config['wordwrap'] = TRUE;
		print_r($this->email);
		$this->email->initialize($config);
		$this->email->from("paulosam6@gmail.com", "Paulosam");
		$this->email->to("pym.4wd@outlook.com"); 
		
		$this->email->subject('SuperBrain Dashboard has been shared with you.');
		$this->email->message($msg);	
		echo $this->email->send();
		//mail("paulosam6@gmail.com", "AAA", "Message");

		echo $this->email->print_debugger();  
	}
	
	function log_post(){
		$userid = $this->post('userid');
		$this->response(array('rseult'=>$this->Log_model->addLog($userid)), 200);		
	}
}