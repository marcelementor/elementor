<?php

namespace Elementor\Core\Kits\Documents\Tabs;

use Elementor\Plugin;
use Elementor\Controls_Manager;
use Elementor\Core\Base\Document;
use Elementor\Core\Files\Uploads_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Settings_Site_Identity extends Tab_Base {

	public function get_id() {
		return 'settings-site-identity';
	}

	public function get_title() {
		return esc_html__( 'Site Identity', 'elementor' );
	}

	public function get_group() {
		return 'settings';
	}

	public function get_icon() {
		return 'eicon-site-identity';
	}

	public function get_help_url() {
		return 'https://go.elementor.com/global-site-identity';
	}

	protected function register_tab_controls() {
		$custom_logo_id = get_theme_mod( 'custom_logo' );
		$custom_logo_src = wp_get_attachment_image_src( $custom_logo_id, 'full' );

		$site_icon_id = get_option( 'site_icon' );
		$site_icon_src = wp_get_attachment_image_src( $site_icon_id, 'full' );

		// If CANNOT upload svg normally, it will add a custom inline option to force svg upload if requested. (in logo and favicon)
		$should_include_svg_inline_option = ! Uploads_Manager::are_unfiltered_uploads_enabled();

		$this->start_controls_section(
			'section_' . $this->get_id(),
			[
				'label' => $this->get_title(),
				'tab' => $this->get_id(),
			]
		);

		$this->add_control(
			$this->get_id() . '_refresh_notice',
			[
				'type' => Controls_Manager::RAW_HTML,
				'raw' => esc_html__( 'Changes will be reflected in the preview only after the page reloads.', 'elementor' ),
				'content_classes' => 'elementor-panel-alert elementor-panel-alert-info',
			]
		);

		$this->add_control(
			'site_name',
			[
				'label' => esc_html__( 'Site Name', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => get_option( 'blogname' ),
				'placeholder' => esc_html__( 'Choose name', 'elementor' ),
				'label_block' => true,
				'dynamic' => [
					'active' => true,
				],
				// 'export' => false,
			]
		);

		$this->add_control(
			'site_description',
			[
				'label' => esc_html__( 'Site Description', 'elementor' ),
				'default' => get_option( 'blogdescription' ),
				'placeholder' => esc_html__( 'Choose description', 'elementor' ),
				'label_block' => true,
				// 'export' => false,
			]
		);

		$this->add_control(
			'site_logo',
			[
				'label' => esc_html__( 'Site Logo', 'elementor' ),
				'type' => Controls_Manager::MEDIA,
				'should_include_svg_inline_option' => $should_include_svg_inline_option,
				'default' => [
					'id' => $custom_logo_id,
					'url' => $custom_logo_src ? $custom_logo_src[0] : '',
				],
				'description' => esc_html__( 'Suggested image dimensions: 350 × 100 pixels.', 'elementor' ),
				// 'export' => false,
			]
		);

		$this->add_control(
			'site_favicon',
			[
				'label' => esc_html__( 'Site Favicon', 'elementor' ),
				'type' => Controls_Manager::MEDIA,
				'should_include_svg_inline_option' => $should_include_svg_inline_option,
				'default' => [
					'id' => $site_icon_id,
					'url' => $site_icon_src ? $site_icon_src[0] : '',
				],
				'description' => esc_html__( 'Suggested favicon dimensions: 512 × 512 pixels.', 'elementor' ),
				// 'export' => false,
			]
		);

		// $cmm = \Elementor\Plugin::$instance->controls_manager;
		// $controls2 = $this->Controls_Manager->get_controls();
		// $kit = \Elementor\Plugin::$instance->kits_manager->get_active_kit_for_frontend();
		// $kits = $kit->get_controls();

		// $document = \Elementor\Plugin::$instance->documents->get( get_the_id() );
		// $docs = $document->get_controls();

		// $controlst = \Elementor\Plugin::$instance->controls_manager->get_controls();
		// $test = \Elementor\Plugin::$instance->controls_manager->register_controls();



		$this->end_controls_section();
	}

	// public function before_save( array $data ) {
	// 	return $data;
	// }

	public function on_save( $data ) {
		if (
			! isset( $data['settings']['post_status'] ) ||
			Document::STATUS_PUBLISH !== $data['settings']['post_status'] ||
			// Should check for the current action to avoid infinite loop
			// when updating options like: "blogname" and "blogdescription".
			strpos( current_action(), 'update_option_' ) === 0
		) {
			return;
		}

		// do_action( 'elementor/controls/register' );
		$abc = [];
		$data['settings']['dapper'] = $abc;
		$data['app'] = [];
		// $data['settings']['site_name'] = '123';
		$all_settings = $settings = $data['settings'];

		// $cm = new Controls_Manager();
		// $controls = $cm->get_controls();
		// $controls = Plugin::$instance->controls_manager->get_controls();
		// $controls = \Elementor\Plugin::$instance->controls_manager->get_controls();

		// $controls = Plugin::$instance->controls_manager->get_controls();
		// $document = Plugin::$instance->documents->get_doc_or_auto_save( get_the_id() );
		// $document = Plugin::$instance->documents->get_doc_or_auto_save( $this->parent->get_id() );
		// $document = Plugin::$instance->documents->get_doc_or_auto_save( $this->get_id() );
		$document = Plugin::$instance->documents->get_doc_or_auto_save( get_the_id() );
		$controls = $document->get_controls();

		foreach ( $controls as $control ) {
			$control_name = $control['name'];
			$test = $control['type'];
			// $control_obj = $cm->get_control( $control['type'] );
			$control_obj = Plugin::$instance->controls_manager->get_control( $control['type'] );
		
			// if ( ! $control_obj instanceof Base_Data_Control ) {
			// 	continue;
			// } else {
			// 	$cont = false;
			// }

			// if ( $control_obj instanceof Control_Repeater ) {
			// 	if ( ! isset( $settings[ $control_name ] ) ) {
			// 		continue;
			// 	}

			// 	foreach ( $settings[ $control_name ] as & $field ) {
			// 		$field = $this->parse_dynamic_settings( $field, $control['fields'], $field );
			// 	}

			// 	continue;
			// }

			$dynamic_settings = $control_obj->get_settings( 'dynamic' );

			

			if ( ! $dynamic_settings ) {
				$dynamic_settings = [];
			}

			if ( ! empty( $control['dynamic'] ) ) {
				$dynamic_settings = array_merge( $dynamic_settings, $control['dynamic'] );
			}

			$tags_manager = Plugin::$instance->dynamic_tags;

			if ( empty( $dynamic_settings ) || ! isset( $all_settings[ $tags_manager::DYNAMIC_SETTING_KEY ][ $control_name ] ) ) {
				continue;
			}

			if ( ! empty( $dynamic_settings['active'] ) && ! empty( $all_settings[ $tags_manager::DYNAMIC_SETTING_KEY ][ $control_name ] ) ) {
				$parsed_value = $control_obj->parse_tags( $all_settings[ $tags_manager::DYNAMIC_SETTING_KEY ][ $control_name ], $dynamic_settings );

				$dynamic_property = ! empty( $dynamic_settings['property'] ) ? $dynamic_settings['property'] : null;

				if ( $dynamic_property ) {
					$settings[ $control_name ][ $dynamic_property ] = $parsed_value;
				} else {
					$settings[ $control_name ] = $parsed_value;
				}
			}
		}

		$data['settings'] = $settings;

		// $kit = Controls_$tags_manager::get_mine();

		// $kit = Plugin::Elementor()->Controls_Manager->get_mine;
		// $controls = Plugin::Elementor()->Controls_Manager->get_controls();
		$tk = $kit;
		$nm = $data['settings'];
		// $document = Plugin::Elementor()->documents->get_doc_or_auto_save_date( $page_id );
		$mydata = $data;
		$tet = $element;

		if ( isset( $data['settings']['site_name'] ) ) {
			update_option( 'blogname', $data['settings']['site_name'] );
		}

		if ( isset( $data['settings']['site_description'] ) ) {
			update_option( 'blogdescription', $data['settings']['site_description'] );
		}

		if ( isset( $data['settings']['site_logo'] ) ) {
			set_theme_mod( 'custom_logo', $data['settings']['site_logo']['id'] );
		}

		if ( isset( $data['settings']['site_favicon'] ) ) {
			update_option( 'site_icon', $data['settings']['site_favicon']['id'] );
		}
	}
}
