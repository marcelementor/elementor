<?php
namespace Elementor\TemplateLibrary;

use Elementor\Api;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Source_Remote_Base extends Source_Base {

	const TEMPLATES_DATA_TRANSIENT_KEY_PREFIX = 'elementor_remote_templates_data_';

	public function __construct() {
		parent::__construct();

		$this->add_actions();
	}

	public function add_actions() {
		add_action( 'elementor/experiments/feature-state-change/container', [ $this, 'clear_cache' ], 10, 0 );
	}

	/**
	 * Get remote template ID.
	 *
	 * Retrieve the remote template ID.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string The remote template ID.
	 */
	public function get_id() {
		return '';
	}

	/**
	 * Get remote template title.
	 *
	 * Retrieve the remote template title.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string The remote template title.
	 */
	public function get_title() {
		return '';
	}

	/**
	 * Register remote template data.
	 *
	 * Used to register custom template data like a post type, a taxonomy or any
	 * other data.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function register_data() {}

	/**
	 * Get remote templates.
	 *
	 * Retrieve remote templates from Elementor.com servers.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param array $args Optional. Not used in remote source.
	 *
	 * @return array Remote templates.
	 */
	public function get_items( $args = [] ) {
		$force_update = ! empty( $args['force_update'] ) && is_bool( $args['force_update'] );

		$templates_data = $this->get_templates_data( $force_update );

		$templates = [];

		foreach ( $templates_data as $template_data ) {
			$templates[] = $this->prepare_template( $template_data );
		}

		return $templates;
	}

	/**
	 * Get remote template.
	 *
	 * Retrieve a single remote template from Elementor.com servers.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param int $template_id The template ID.
	 *
	 * @return array Remote template.
	 */
	public function get_item( $template_id ) {
		$templates = $this->get_items();

		return $templates[ $template_id ];
	}

	/**
	 * Save remote template.
	 *
	 * Remote template from Elementor.com servers cannot be saved on the
	 * database as they are retrieved from remote servers.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param array $template_data Remote template data.
	 *
	 * @return \WP_Error
	 */
	public function save_item( $template_data ) {
		return new \WP_Error( 'invalid_request', 'Cannot save template to a remote source' );
	}

	/**
	 * Update remote template.
	 *
	 * Remote template from Elementor.com servers cannot be updated on the
	 * database as they are retrieved from remote servers.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param array $new_data New template data.
	 *
	 * @return \WP_Error
	 */
	public function update_item( $new_data ) {
		return new \WP_Error( 'invalid_request', 'Cannot update template to a remote source' );
	}

	/**
	 * Delete remote template.
	 *
	 * Remote template from Elementor.com servers cannot be deleted from the
	 * database as they are retrieved from remote servers.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param int $template_id The template ID.
	 *
	 * @return \WP_Error
	 */
	public function delete_template( $template_id ) {
		return new \WP_Error( 'invalid_request', 'Cannot delete template from a remote source' );
	}

	/**
	 * Export remote template.
	 *
	 * Remote template from Elementor.com servers cannot be exported from the
	 * database as they are retrieved from remote servers.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param int $template_id The template ID.
	 *
	 * @return \WP_Error
	 */
	public function export_template( $template_id ) {
		return new \WP_Error( 'invalid_request', 'Cannot export template from a remote source' );
	}

	/**
	 * Get remote template data.
	 *
	 * Retrieve the data of a single remote template from Elementor.com servers.
	 *
	 * @since 1.5.0
	 * @access public
	 *
	 * @param array  $args    Custom template arguments.
	 * @param string $context Optional. The context. Default is `display`.
	 *
	 * @return array|\WP_Error Remote Template data.
	 */
	public function get_data( array $args, $context = 'display' ) {
		$data = $this->get_template_content( $args['template_id'] );

		if ( is_wp_error( $data ) ) {
			return $data;
		}

		// Set the Request's state as an Elementor upload request, in order to support unfiltered file uploads.
		Plugin::$instance->uploads_manager->set_elementor_upload_state( true );

		// BC.
		$data = (array) $data;

		$data['content'] = $this->replace_elements_ids( $data['content'] );
		$data['content'] = $this->process_export_import_content( $data['content'], 'on_import' );

		$post_id = $args['editor_post_id'];
		$document = Plugin::$instance->documents->get( $post_id );
		if ( $document ) {
			$data['content'] = $document->get_elements_raw_data( $data['content'], true );
		}

		// After the upload complete, set the elementor upload state back to false
		Plugin::$instance->uploads_manager->set_elementor_upload_state( false );

		return $data;
	}

	protected function get_template_content( $template_id ) {
		return Api::get_template_content( $template_id );
	}

	/**
	 * Get templates data from a transient or from a remote request.
	 * In any of the following 2 conditions, the remote request will be triggered:
	 * 1. Force update - "$force_update = true" parameter was passed.
	 * 2. The data saved in the transient is empty or not exist.
	 *
	 * @param bool $force_update
	 * @return array
	 */
	protected function get_templates_data( bool $force_update ): array {
		$templates_data_cache_key = static::TEMPLATES_DATA_TRANSIENT_KEY_PREFIX . ELEMENTOR_VERSION;

		$experiments_manager = Plugin::$instance->experiments;
		$editor_layout_type = $experiments_manager->is_feature_active( 'container' ) ? 'container_flexbox' : '';

		if ( $force_update ) {
			return $this->get_templates( $editor_layout_type );
		}

		$templates_data = get_transient( $templates_data_cache_key );

		if ( empty( $templates_data ) ) {
			return $this->get_templates( $editor_layout_type );
		}

		return $templates_data;
	}

	/**
	 * Get the templates from a remote server and set a transient.
	 *
	 * @param string $editor_layout_type
	 * @return array
	 */
	protected function get_templates( string $editor_layout_type ): array {
		$templates_data_cache_key = static::TEMPLATES_DATA_TRANSIENT_KEY_PREFIX . ELEMENTOR_VERSION;

		$templates_data = $this->get_templates_remotely( $editor_layout_type );

		if ( empty( $templates_data ) ) {
			return [];
		}

		set_transient( $templates_data_cache_key, $templates_data, 12 * HOUR_IN_SECONDS );

		return $templates_data;
	}

	public function clear_cache() {
		delete_transient( static::TEMPLATES_DATA_TRANSIENT_KEY_PREFIX . ELEMENTOR_VERSION );
	}
}
