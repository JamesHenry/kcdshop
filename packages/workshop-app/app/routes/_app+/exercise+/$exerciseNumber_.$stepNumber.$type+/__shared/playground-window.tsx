import { Icon } from '#app/components/icons'
import { SimpleTooltip } from '#app/components/ui/tooltip.js'
import { PlaygroundChooser, SetPlayground } from '#app/routes/set-playground'

export function PlaygroundWindow({
	playgroundAppName,
	problemAppName,
	isUpToDate,
	allApps,
	children,
}: {
	playgroundAppName?: string
	problemAppName?: string
	isUpToDate: boolean
	allApps: Array<{ name: string; displayName: string }>
	children: React.ReactNode
}) {
	const isCorrectApp = playgroundAppName === problemAppName
	const playgroundLinkedUI =
		isCorrectApp && isUpToDate ? (
			<Icon size="xl" name="Linked" />
		) : (
			<Icon
				size="xl"
				name="Unlinked"
				className="animate-pulse text-foreground-destructive"
			/>
		)
	let setPlaygroundTooltipText = 'Click to reset Playground.'
	if (!isUpToDate) {
		setPlaygroundTooltipText =
			'Playground is out of date. Click to reset Playground.'
	}
	if (!isCorrectApp) {
		setPlaygroundTooltipText =
			'Playground is not set to the right app. Click to set Playground.'
	}
	return (
		<div className="flex h-full w-full flex-col justify-between">
			<div className="flex h-14 flex-shrink-0 items-center justify-start gap-2 border-b px-3">
				<div className="display-alt-up">
					{problemAppName ? (
						<SetPlayground
							appName={problemAppName}
							tooltipText={setPlaygroundTooltipText}
						>
							{playgroundLinkedUI}
						</SetPlayground>
					) : (
						<SimpleTooltip content="No problem app available for this step">
							<div>
								<Icon name="Question" />
							</div>
						</SimpleTooltip>
					)}
				</div>
				<div className="display-alt-down">
					{playgroundAppName ? (
						<SetPlayground
							appName={playgroundAppName}
							reset
							tooltipText="Reset Playground"
						>
							<div className="flex h-7 w-7 items-center justify-center">
								<Icon name="Refresh" />
							</div>
						</SetPlayground>
					) : (
						<div className="h-7 w-7" />
					)}
				</div>
				<PlaygroundChooser
					allApps={allApps}
					playgroundAppName={playgroundAppName}
				/>
			</div>
			<div className="flex h-full flex-1 flex-grow items-center justify-center">
				{children}
			</div>
		</div>
	)
}
