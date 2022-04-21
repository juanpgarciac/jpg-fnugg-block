<?php
//define endpoint
define('FNUGGAPIURL','https://api.fnugg.no/');

class FnuggAPIMiddleware
{

    public function register_routes(){
        register_rest_route( 'jpg-fnugg-api/v1', '/autocomplete(?:/(?P<query>.+))?', array(
            'methods' => 'GET',
            'callback' => array($this,'fnugg_fetch_autocomplete'),
            'args' => [
              'query'
              ],
            'permission_callback' => '__return_true'
          ) );

        register_rest_route( 'jpg-fnugg-api/v1', '/search(?:/(?P<query>.+))?', array(
            'methods' => 'GET',
            'callback' => array($this,'fnugg_fetch_search'),
            'args' => [
              'query'
              ],
            'permission_callback' => '__return_true'
          ) );
    }


    /**
     * Retrieve the API response from fnugg autocomplete endopoint
     *
     * @param WP_REST_Request request
     * @return string in JSON format
     */
    function fnugg_fetch_autocomplete(  WP_REST_Request $request ) {        

        $query = $request['query'];

        $response = wp_remote_get( "https://api.fnugg.no/suggest/autocomplete?q=$query");
        
        if( is_wp_error( $response ) ) {
            return new WP_Error( 'error', 'There was an error processing the query: '.WP_Error::get_error_messages($response) );
        }
        $data = json_decode(  $response['body'],true);
    
        return $data;
    }

    /**
     * Retrieve the API response from fnugg search endopoint
     *
     * @param WP_REST_Request request
     * @return string in JSON format
     */

    function fnugg_fetch_resort( $data ) {
        return json_decode([]);
    }


}


$fnuggapi = new FnuggAPIMiddleware();

add_action( 'rest_api_init', [$fnuggapi,'register_routes']);