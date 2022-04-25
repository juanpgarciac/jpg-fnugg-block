<?php
namespace App;
use Phpfastcache\CacheManager;
use Phpfastcache\Config\ConfigurationOption;

define('FNUGG_API_URL','https://api.fnugg.no');//Fnugg api base url
define('FNUGG_CACHE_EXPIRATION',86400); //Cache time expiration in seconds


class FnuggAPIMiddleware
{
    private $InstanceCache = null;

    function __construct(){
        //Init cache handler (https://github.com/PHPSocialNetwork/phpfastcache)
        CacheManager::setDefaultConfig(new ConfigurationOption([
            'path' => sys_get_temp_dir().'/.phpfastcache',
        ]));
        
        $this->InstanceCache = CacheManager::getInstance('files');
    }

    public function register_routes(){

        //register autocomplete api route
        register_rest_route( 'jpg-fnugg-api/v1', '/autocomplete(?:/(?P<query>.+))?', array(
            'methods' => 'GET',
            'callback' => array($this,'fnugg_fetch_autocomplete'),
            'args' => [
              'query' => []
              ],
            'permission_callback' => '__return_true'
          ) );

        //register search resort (by name) api route
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
    function fnugg_fetch_autocomplete(\WP_REST_Request $request ) {        

        $query = urldecode($request['query']);

        //$this->InstanceCache->clear();

        //get query from cache (I use autocomplete prefix to avoid conflict with the resort names cache keys).  (also replace invalid characters for safe _ )
        $cachedQuery = $this->InstanceCache->getItem('autocomplete-'.str_replace(str_split('{}()/\@:'),'_',$query));


        //get collected resort names from cache (if any)
        $cachedResortNames = $this->InstanceCache->getItem('results');        


        //if the query is not found or expired, or the resortnames list is empty: fetch api, save the data response into cache and return it. 
        if (!$cachedQuery->isHit() || $cachedResortNames->get() == null || $cachedResortNames->isEmpty() ) {

            $response = wp_remote_get( FNUGG_API_URL."/suggest/autocomplete?q=$query");
            
            if( is_wp_error( $response ) ) {
                return new \WP_Error( 'error', 'There was an error processing the query');
            }
            $data = [];
            if(isset($response['body'])){            
                $data = json_decode(  $response['body'],true);
                $data = isset($data["result"]) ? array_column($data["result"],"name") ?? [] : [] ;
            }
            //CACHE HANDLING (SET)

            //merge and make unique set of resorts names and save it into cache (this is for avoid redundant info)
            $newSetResortNames = array_unique(array_merge($data,$cachedResortNames->get() ?? []),SORT_REGULAR);
            $cachedResortNames->set($newSetResortNames)->expiresAfter(FNUGG_CACHE_EXPIRATION); 
            $this->InstanceCache->save($cachedResortNames);


            //set the query into cache (I use autocomplete prefix to avoid conflict with the resort cache keys)
            $cachedQuery->set('autocomplete-'.$query)->expiresAfter(FNUGG_CACHE_EXPIRATION); 
            $this->InstanceCache->save($cachedQuery);

        } else {
            //otherwise return cached results from the saved resorts names (with the filter logic for "autocomplete"). 
            $data = array_filter($cachedResortNames->get()??[],function($entry) use ($query){
                return mb_strpos(strtolower($entry), strtolower($query)) !== false;
            });
        }
        sort($data);
        return $data;
    }

    /**
     * Retrieve the API response from fnugg search endpoint
     *
     * @param WP_REST_Request request
     * @return string in JSON format
     */

    function fnugg_fetch_resort( \WP_REST_Request $request ) {

        $query = $request['query'];

        //get resort from cache (replace invalid characters for safe _ )
        $cachedResort = $this->InstanceCache->getItem(str_replace(str_split('{}()/\@:'),'_',$query));

        //if the resort "key" is not found or expired: fetch api, save the data response into cache and return it. 
        if (!$cachedResort->isHit()) {
            $sourceFields = 'name,images.image_1_1_s,conditions.forecast.today.top';
            $response = wp_remote_get( FNUGG_API_URL."/search?q={$query}&sourceFields={$sourceFields}");
            
            if( is_wp_error( $response ) ) {
                return new \WP_Error( 'error', 'There was an error processing the query');
            }

            $data = json_decode(  $response['body'],true);
            
            //If the data hits the resort, extract the requested parameters 
            if(isset($data["hits"]["hits"][0]["_source"])){
                $source = $data["hits"]["hits"][0]["_source"];
                $conditions = $source["conditions"]["forecast"]["today"]["top"];
                $resort = [
                    "name" => $source["name"],
                    "image" => $source["images"]["image_1_1_s"],
                    "last_updated" => date("d.m.Y - h:i",strtotime($conditions["last_updated"])),
                    "sky" => $conditions["symbol"]["name"],
                    "condition" => $conditions["condition_description"],
                    "wind" => $conditions["wind"],
                    "temperature" => $conditions["temperature"]
                ];
                
                //CACHE HANDLING (SET)

                $cachedResort->set($resort)->expiresAfter(FNUGG_CACHE_EXPIRATION); 
                $this->InstanceCache->save($cachedResort); 
                
                return $resort;
            }
        } else {
            //otherwise return cached resort. 
            return $cachedResort->get();
        }
        return new \WP_Error( 'error', 'There was an error processing the query');
    }


}


$fnuggapi = new \App\FnuggAPIMiddleware();

add_action( 'rest_api_init', array($fnuggapi,'register_routes'));