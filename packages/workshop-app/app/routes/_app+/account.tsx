import { deleteCache } from '@epic-web/workshop-utils/cache.server'
import {
	deleteDb,
	requireAuthInfo,
	setPresencePreferences,
} from '@epic-web/workshop-utils/db.server'
import { type SEOHandle } from '@nasa-gcn/remix-seo'
import { redirect, type LoaderFunctionArgs } from '@remix-run/node'
import { Form, Link } from '@remix-run/react'
import { Button } from '#app/components/button.tsx'
import { Icon } from '#app/components/icons.tsx'
import { SimpleTooltip } from '#app/components/ui/tooltip.js'
import { useOptionalDiscordMember, useUser } from '#app/components/user.tsx'
import { useWorkshopConfig } from '#app/components/workshop-config.tsx'
import { ensureUndeployed } from '#app/utils/misc.tsx'
import { usePresencePreferences } from '#app/utils/presence.tsx'
import { redirectWithToast } from '#app/utils/toast.server.ts'

export const handle: SEOHandle = {
	getSitemapEntries: () => null,
}

export async function loader({ request }: LoaderFunctionArgs) {
	ensureUndeployed()
	await requireAuthInfo({ request })
	return {}
}

export async function action({ request }: { request: Request }) {
	ensureUndeployed()
	const formData = await request.formData()
	const intent = formData.get('intent')
	if (intent === 'logout') {
		await deleteDb()
		await deleteCache()
		return redirectWithToast('/login', {
			type: 'success',
			title: 'Logged out',
			description: 'Goodbye! Come back soon!',
		})
	} else if (intent === 'presence-opt-out') {
		const optOut = formData.get('optOut') === 'true'
		await setPresencePreferences({ optOut })
		return redirectWithToast('/account', {
			title: optOut ? 'Opted out' : 'Opted in',
			description: `You are now ${optOut ? 'invisible' : 'visible'}.`,
			type: 'success',
		})
	}

	return redirect('/account')
}

function useConnectDiscordURL() {
	const {
		product: { host },
	} = useWorkshopConfig()
	return `https://${host}/discord`
}

export default function Account() {
	const user = useUser()
	const discordMember = useOptionalDiscordMember()
	const presencePreferences = usePresencePreferences()
	const connectDiscordURL = useConnectDiscordURL()
	return (
		<main className="container flex h-full w-full max-w-3xl flex-grow flex-col items-center justify-center gap-4">
			{user.imageUrlLarge ? (
				<img
					className="h-36 w-36 rounded-full"
					alt={discordMember?.displayName ?? user.name ?? user.email}
					src={user.imageUrlLarge}
				/>
			) : (
				<Icon name="User" className="flex-shrink-0" size="lg" />
			)}
			<h1 className="mb-1 text-2xl">Your Account</h1>
			<p className="text-center text-gray-700 dark:text-gray-300">
				{user.name
					? `Hi ${
							discordMember?.displayName ?? user.name
						}, your device is logged in with ${user.email}.`
					: `Your device is logged in with ${user.email}.`}
			</p>
			{discordMember ? (
				<>
					<p className="text-center text-gray-700 dark:text-gray-300">
						And you are connected to discord as{' '}
						<a
							href={`https://discord.com/users/${discordMember.id}`}
							target="_blank"
							rel="noopener noreferrer"
							className="underline"
						>
							{discordMember.displayName}
						</a>
						.
					</p>
				</>
			) : (
				<div className="flex items-center gap-2">
					<Link
						to={connectDiscordURL}
						className="inline-flex items-center gap-2 underline"
					>
						<Icon name="Discord" size="lg" />
						Connect Discord
					</Link>
					<SimpleTooltip content="This will give you access to the exclusive Discord channels for Epic Web">
						<Icon name="Question" tabIndex={0} />
					</SimpleTooltip>
				</div>
			)}
			<div className="flex items-center gap-2">
				<Form method="POST">
					<input
						name="optOut"
						type="hidden"
						value={presencePreferences?.optOut ? 'false' : 'true'}
					/>
					<Button varient="mono" name="intent" value="presence-opt-out">
						{presencePreferences?.optOut ? 'Opt in to' : 'Opt out of'} presence
					</Button>
				</Form>
				<SimpleTooltip content="This controls whether your name and avatar are displayed in the pile of faces in navigation">
					<Icon name="Question" tabIndex={0} />
				</SimpleTooltip>
			</div>
			<div className="flex items-center gap-2">
				<Form method="post">
					<Button varient="mono" name="intent" value="logout">
						Log device out
					</Button>
				</Form>
				<SimpleTooltip
					content={
						<div>
							Note: it is your <i className="italic">device</i> that's logged
							in, not your browser.
							<br />
							So all browsers on this device will be logged in with the same
							account on this device.
						</div>
					}
				>
					<Icon name="Question" tabIndex={0} />
				</SimpleTooltip>
			</div>
			<p>
				Check{' '}
				<Link to="/onboarding" className="underline">
					/onboarding
				</Link>{' '}
				if you'd like to review onboarding again.
			</p>
			<p>
				Check{' '}
				<Link to="/support" className="underline">
					/support
				</Link>{' '}
				if you need support.
			</p>
		</main>
	)
}
