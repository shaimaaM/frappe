import Widget from "./base_widget.js";
import { generate_route } from "./utils";

const indicator_colors = ["Grey", "Green", "Red", "Orange", "Pink", "Yellow", "Blue", "Cyan", "Teal"]
export default class ShortcutWidget extends Widget {
	constructor(opts) {
		opts.shadow = true;
		super(opts);
	}

	get_config() {
		return {
			name: this.name,
			icon: this.icon,
			label: this.label,
			format: this.format,
			link_to: this.link_to,
			color: this.color,
			restrict_to_domain: this.restrict_to_domain,
			stats_filter: this.stats_filter,
			type: this.type,
		};
	}

	setup_events() {
		this.widget.click(() => {
			if (this.in_customize_mode) return;

			let route = generate_route({
				route: this.route,
				name: this.link_to,
				type: this.type,
				is_query_report: this.is_query_report,
				doctype: this.ref_doctype,
			});

			let filters = this.get_doctype_filter();
			if (this.type == "DocType" && filters) {
				frappe.route_options = filters;
			}
			frappe.set_route(route);
		});
	}

	set_actions() {
		if (this.in_customize_mode) return;

		this.widget.addClass("shortcut-widget-box");

		let filters = this.get_doctype_filter();
		if (this.type == "DocType" && filters) {
			frappe.db
				.count(this.link_to, {
					filters: filters,
				})
				.then((count) => this.set_count(count));
		}
	}

	get_doctype_filter() {
		let count_filter = new Function(`return ${this.stats_filter}`)();
		if (count_filter) {
			return count_filter;
		}

		return null;
	}

	set_count(count) {
		const get_label = () => {
			if (this.format) {
				return this.format.replace(/{}/g, count);
			}
			return count;
		};

		this.action_area.empty();
		const label = get_label();
		let color = indicator_colors.includes(this.color)
			? this.color.toLowerCase()
			: 'grey';
		
		const buttons = $(`<div class="indicator-pill ${color}">${label}</div>`);
		buttons.appendTo(this.action_area);
	}
}