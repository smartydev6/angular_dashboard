<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Reporting extends CI_Controller {

	public function index()
	{
		
	}
	
	public function pdf(){
		$this->load->library('pdf');
		$pdf = $this->pdf->load();
		header('Content-Description: File Transfer');
		header('Content-Type: application/pdf');
		header('Content-Disposition: attachment; filename=report.pdf');
		header('Content-Transfer-Encoding: binary');
		header('Expires: 0');
		header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
		header('Pragma: public'); 
		$data = $this->input->post('data'); 
		
		//list($type, $data) = explode(';', $data);
		//list(, $data)      = explode(',', $data);
		$html = '<style>
				@page { sheet-size: A3-L; }
				@page bigger { sheet-size: 420mm 370mm; }
				@page toc { sheet-size: A4; }

				h1.bigsection {
						page-break-before: always;
						page: bigger;
				}
				</style>';
		$html .= '<img src="' . $data . '">';
		$pdf->WriteHTML($html); // write the HTML into the PDF
		$pdf->Output('report.pdf', 'D'); // save to file because we can 
	}
}

/* End of file reporting.php */
/* Location: ./application/controllers/reporting.php */