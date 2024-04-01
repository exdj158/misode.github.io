import type { ItemStack } from 'deepslate/core'
import { Identifier } from 'deepslate/core'
import { useEffect, useRef, useState } from 'preact/hooks'
import { useVersion } from '../contexts/Version.jsx'
import { useAsync } from '../hooks/useAsync.js'
import { getCollections } from '../services/Schemas.js'
import { ItemTooltip } from './ItemTooltip.jsx'
import { Octicon } from './Octicon.jsx'

interface Props {
	item: ItemStack,
	slotDecoration?: boolean,
	tooltip?: boolean,
	advancedTooltip?: boolean,
}
export function ItemDisplay({ item:outerItem, slotDecoration, tooltip, advancedTooltip }: Props) {
	const [item, setCloneItem] = useState(outerItem)
	const el = useRef<HTMLDivElement>(null)
	const [tooltipOffset, setTooltipOffset] = useState<[number, number]>([0, 0])
	const [tooltipSwap, setTooltipSwap] = useState(false)

	useEffect(()=>{
		fetch(`http://localhost:8080/api/getMaterialInfo?namespace=${item.id.namespace}&id=${item.id.path}`).then(response => response.json())
			.then(data => {
				if(data){
					const tmpItem = outerItem.clone()
					if(data.maxDamage){
						// @ts-ignore
						tmpItem.getItem().durability = data.maxDamage
					}
					if(data.maxStackSize){
						// @ts-ignore
						tmpItem.getItem().stack = data.maxStackSize
					}
					if(data.localized){
						// @ts-ignore
						tmpItem.getItem().displayName = data.localized
					}
					if(data.icon){
						// @ts-ignore
						tmpItem.getItem().icon=data.icon
					}
					setCloneItem(tmpItem)
				}
			})
	},[])

	useEffect(() => {
		const onMove = (e: MouseEvent) => {
			requestAnimationFrame(() => {
				const { right, width } = el.current!.getBoundingClientRect()
				const swap = right + 200 > document.body.clientWidth
				setTooltipSwap(swap)
				setTooltipOffset([(swap ? width - e.offsetX : e.offsetX) + 20, e.offsetY - 40])
			})
		}
		el.current?.addEventListener('mousemove', onMove)
		return () => el.current?.removeEventListener('mousemove', onMove)
	}, [])

	const maxDamage = item.getItem().durability

	return <div class="item-display" ref={el}>
		<ItemItself item={item} />
		{item.count !== 1 && <>
			<svg class="item-count" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMinYMid meet">
				<text x="95" y="93" font-size="50" textAnchor="end" fontFamily="MinecraftSeven" fill="#373737">{item.count}</text>
				<text x="90" y="88" font-size="50" textAnchor="end" fontFamily="MinecraftSeven" fill="#ffffff">{item.count}</text>
			</svg>
		</>}
		{slotDecoration && <>
			{(maxDamage && item.tag.getNumber('Damage') > 0) && <svg class="item-durability" width="100%" height="100%" viewBox="0 0 18 18">
				<rect x="3" y="14" width="13" height="2" fill="#000" />
				<rect x="3" y="14" width={`${(maxDamage - item.tag.getNumber('Damage')) / maxDamage * 13}`} height="1" fill={`hsl(${(maxDamage - item.tag.getNumber('Damage')) / maxDamage * 120}deg, 100%, 50%)`} />
			</svg>}
			<div class="item-slot-overlay"></div>
		</>}
		{tooltip !== false && <div class="item-tooltip" style={tooltipOffset && {
			left: (tooltipSwap ? undefined : `${tooltipOffset[0]}px`),
			right: (tooltipSwap ? `${tooltipOffset[0]}px` : undefined),
			top: `${tooltipOffset[1]}px`,
		}}>
			<ItemTooltip item={item} advanced={advancedTooltip} />
		</div>}
	</div>
}

function CustomItem({ item }: {item: ItemStack}){
	// @ts-ignore
	if(item.getItem().icon){
		// @ts-ignore
		return <img src={`http://localhost:8080/api/getMaterialImg?filePath=${encodeURIComponent(item.getItem().icon)}`} alt={item.id.toString()} class="model" draggable={false} />
	}

	return Octicon.package
}

function ItemItself({ item }: Props) {
	const { version } = useVersion()

	if (item.id.namespace !== Identifier.DEFAULT_NAMESPACE) {
		// @ts-ignore
		return <CustomItem item={item}/>
	}

	const { value: collections } = useAsync(() => getCollections(version), [])

	if (collections === undefined) {
		return null
	}

	// @ts-ignore
	return <CustomItem item={item}/>
}
