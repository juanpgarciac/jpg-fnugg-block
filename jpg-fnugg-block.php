<?php
/**
 * Plugin Name:       Jpg Fnugg Block
 * Description:       Fnugg resorts search component and view card Block.
 * Requires at least: 5.8
 * Requires PHP:      7.0
 * Version:           1.0.0
 * Author:            The WordPress Contributors
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       jpg-fnugg-block
 *
 * @package           jpg
 */

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */

defined('ABSPATH') or die('No access');
if( ! function_exists('add_action')){
    die('No access');
}

function create_block_jpg_fnugg_block_block_init() {
	register_block_type( __DIR__ . '/build' );
    wp_enqueue_style( 'jpg-font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.14.0/css/all.min.css');
}
add_action( 'init', 'create_block_jpg_fnugg_block_block_init' );

require(__DIR__.'/vendor/autoload.php'); //loading external libraries

if(!class_exists('FnuggAPIMiddleware')){
    require(__DIR__.'/app/FnuggAPIMiddleware.php');
}