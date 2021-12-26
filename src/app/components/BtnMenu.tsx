import type { ComponentChildren } from 'preact'
import type { Octicon } from '.'
import { Btn } from '.'
import { useFocus } from '../hooks'

interface BtnMenuProps extends JSX.HTMLAttributes<HTMLDivElement> {
	icon?: keyof typeof Octicon,
	label?: string,
	relative?: boolean,
	tooltip?: string,
	children: ComponentChildren,
}
export function BtnMenu(props: BtnMenuProps) {
	const { icon, label, relative, tooltip, children } = props
	const [active, setActive] = useFocus()

	return <div class={`btn-menu${relative === false ? ' no-relative' : ''}`} {...props}>
		<Btn {...{icon, label, tooltip}} onClick={setActive} />
		{active && <div class="btn-group">
			{children}
		</div>}
	</div>
}
