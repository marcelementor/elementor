import Base from '../types/base/element-base';
import Model from 'elementor-elements/models/widget';
import { default as View } from 'elementor-elements/views/heading';

export default class Heading extends Base {
	getType() {
		return 'heading';
	}

	getView() {
		return View;
	}

	getModel() {
		return Model;
	}
}
