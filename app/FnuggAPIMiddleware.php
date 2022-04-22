<?php
//define endpoint
define('FNUGGAPIURL','https://api.fnugg.no');

class FnuggAPIMiddleware
{

    public function register_routes(){
        register_rest_route( 'jpg-fnugg-api/v1', '/autocomplete(?:/(?P<query>.+))?', array(
            'methods' => 'GET',
            'callback' => array($this,'fnugg_fetch_autocomplete'),
            'args' => [
              'query' => []
              ],
            'permission_callback' => '__return_true'
          ) );

        register_rest_route( 'jpg-fnugg-api/v1', '/search(?:/(?P<query>.+))?', array(
            'methods' => 'GET',
            'callback' => array($this,'fnugg_fetch_resort'),
            'args' => [
              'query' => []
              ],
            'permission_callback' => '__return_true'
          ) );
    }


    /**
     * Retrieve the API response from fnugg autocomplete endpoint
     *
     * @param WP_REST_Request request
     * @return string in JSON format
     */
    function fnugg_fetch_autocomplete( WP_REST_Request $request ) {        

        $query = $request['query'];

        $response = wp_remote_get( FNUGGAPIURL."/suggest/autocomplete?q=$query");
        
        if( is_wp_error( $response ) ) {
            return new WP_Error( 'error', 'There was an error processing the query');
        }
        $data = json_decode(  $response['body'],true);
    
        return $data;
    }

    /**
     * Retrieve the API response from fnugg search endpoint
     *
     * @param WP_REST_Request request
     * @return string in JSON format
     */

    function fnugg_fetch_resort( WP_REST_Request $request ) {

        $query = $request['query'];

        $response = wp_remote_get( FNUGGAPIURL."/search?q=$query&sourceFields=name,images.image_1_1_s,conditions.forecast.today.top,region");
        
        if( is_wp_error( $response ) ) {
            return new WP_Error( 'error', 'There was an error processing the query');
        }

        $data = json_decode(  $response['body'],true);
        
        //If the data hits the resort, extract the requested parameters 
        if(isset($data["hits"]["hits"][0]["_source"])){
            $source = $data["hits"]["hits"][0]["_source"];
            $conditions = $source["conditions"]["forecast"]["today"]["top"];
            $resort = [
                "name" => $source["name"],
                "image" => $source["images"]["image_1_1_s"],
                "region" => $source["region"][0],
                "last_updated" => date("d.m.Y - h:i",strtotime($conditions["last_updated"])),
                "sky" => $conditions["symbol"]["name"],
                "condition" => $conditions["condition_description"],
                "wind" => $conditions["wind"],
                "temperature" => $conditions["temperature"]
            ];
            return $resort;
        }
        return new WP_Error( 'error', 'There was an error processing the query');
    }


}


$fnuggapi = new FnuggAPIMiddleware();

add_action( 'rest_api_init', array($fnuggapi,'register_routes'));