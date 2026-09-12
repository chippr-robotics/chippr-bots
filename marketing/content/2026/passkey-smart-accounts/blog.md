# Passkey Smart Accounts: A Wallet You Open With Your Fingerprint

*How FairWins turned Face ID into a real, self-custodial crypto account — no seed phrase, no browser extension, nothing to write down*

| | |
|---|---|
| **Series** | Accounts & Keys (part 1) |
| **Audience** | Product folks, founders, crypto-curious readers, and developers new to wallets |
| **Tags** | `passkeys`, `wallets`, `self-custody`, `onboarding`, `account-abstraction` |
| **Reading time** | ~7 minutes |

## The twelve words nobody wants to write down

Picture how someone joins a peer-to-peer wager app. A friend sends a link. You have never installed a crypto wallet, you have never copied twelve recovery words onto a scrap of paper, and you are not about to start tonight. What you *do* have is a phone with a fingerprint sensor and a small, tamper-resistant security chip that has been quietly signing things for you — payments, app logins — for years.

That chip speaks a standard called **passkeys** — the same WebAuthn technology behind Face ID and fingerprint sign-in on the sites you already use. When you create a passkey, your device generates a private key that it never hands out. It will only prove who you are after a biometric check, and the secret itself never leaves the hardware. That is exactly the security model crypto wallets have chased for a decade: a key that can't be exported, phished, or pasted into a fake support chat.

There is one stubborn catch. Passkeys and Ethereum accounts speak different mathematical "dialects" for signatures. The security chip in your phone signs using one type of cryptographic curve; ordinary Ethereum accounts expect a different one. They simply don't recognize each other's signatures, and no amount of interface polish papers over that. If you want a passkey to control real funds, the account itself has to become a small smart contract — a program on the blockchain — that knows how to read the passkey's dialect. And something other than the user has to be able to submit that first transaction, because a brand-new passkey can't pay a network fee from an account that doesn't exist on-chain yet.

That is the whole idea behind FairWins passkey accounts: a smart-contract wallet controlled by a passkey, able to verify the phone's signatures directly, living at an address that's known before the wallet is ever deployed.

## An account is a list of owners, not a single key

Rather than build this from scratch, FairWins uses a widely deployed, professionally audited smart-wallet design — Coinbase's Smart Wallet — and adopts it as-is, without rewriting its logic. The rule is deliberate: an audited contract is only worth something if you don't quietly fork and change it. Reusing it unmodified means those outside audits still apply.

The clever part of that design is how it defines ownership. An "owner" of the account isn't one fixed key; it's simply an entry in a list, and each entry can be one of two things:

- a linked ordinary Ethereum wallet address (say, a MetaMask you already have), or
- a passkey — represented by the two numbers that make up its public key.

Both kinds sit in the same list and carry equal authority. Any owner can add or remove other owners, and the contract refuses to remove the *last* one — so an account can never accidentally lock itself out by deleting its only controller. When a signature arrives, the account looks at which owner produced it and checks it the right way: the passkey path for a passkey, the ordinary path for a linked wallet. One mechanism covers both signing in for transactions and approving off-chain messages.

## Checking a passkey signature on the blockchain

A passkey signature is more than a scribble over some data. When your device signs, it wraps the thing you're approving inside a small standardized bundle that also records details like "this was a genuine WebAuthn sign-in" and "a user was present." To trust that signature, the contract re-runs the important checks from the official WebAuthn specification right on-chain: it confirms the bundle is the expected kind, that the challenge inside it matches what was really being approved, that a user was actually present, and it rejects a known signature-tampering trick. It deliberately skips a few checks that the phone and the app's site association already enforce — an honest trade that keeps verification affordable.

Then there's the heavy math of actually verifying the signature, which is expensive to do on a blockchain. Where the network offers a fast built-in helper for exactly this kind of signature, the contract uses it (cheap — a few thousand units of gas). Where a network doesn't, the same contract quietly falls back to doing the math the slow, pure-software way. Same code, both worlds — which is why supporting a new network later is a configuration change, not a contract rewrite.

## An address before there's an account

Here's a nice trick that makes onboarding feel instant: your account address exists *before* the wallet is actually deployed. The address is calculated purely from your initial list of owners, so the app can show it — and a friend can send funds to it — while the contract itself is still just a plan. FairWins deploys the piece that mints these addresses in an identical way on every supported network, so your address is the same everywhere.

Deployment happens lazily, the first time you actually do something. That first action carries a little bundle of setup instructions: the network deploys your account and performs your transaction together, in one shot. (One hard-won lesson from building this: a popular off-the-shelf toolkit assumed a *different* deployment source than the one FairWins uses, which quietly produced the wrong predicted address and made every early transaction fail. The fix was to pin everything to the exact same source. If you ever wire a custom wallet into a generic toolkit, check its address assumptions first.)

## No seed phrase doesn't mean no keys

Passkeys are great at signing but they don't encrypt. Some FairWins features — the private ones — need encryption keys too. So the app uses a companion capability of the passkey standard to derive a stable secret from your authenticator, stretch it into an encryption key, and use that to wrap a single master seed. Every owner on the account unwraps the *same* seed, which is why your encrypted data survives switching devices. If an authenticator doesn't support this capability, the app says so plainly rather than silently generating the wrong keys.

## Why we built it this way

- **Reuse an audited design, don't fork it.** Using the Coinbase Smart Wallet unmodified keeps its outside security audits meaningful. A private fork would need re-auditing forever.
- **Upgrades belong to the user.** These accounts can be upgraded, but only the account's own owner can authorize that. FairWins holds no override switch over anyone's wallet — which is what makes this genuinely self-custodial, not "self-custodial" in scare quotes.
- **Fast where possible, correct everywhere.** Using the network's built-in signature helper where it exists, and falling back to software elsewhere, costs a bit more on some chains but means one single codebase runs everywhere.
- **Honest about fees.** The confirm screen only says a transaction is sponsored when it truly is; otherwise it says you pay the network fee. (A later post covers how sponsorship works.)

The result is an account you open with a thumbprint, funded at an address that exists before the contract does, and controlled by keys that no server — including ours — ever holds.

## Further reading

- Passkeys / WebAuthn (W3C): <https://www.w3.org/TR/webauthn-2/>
- What passkeys are, in plain terms (FIDO Alliance): <https://fidoalliance.org/passkeys/>
- The ERC-4337 account-abstraction standard (smart-contract wallets): <https://eips.ethereum.org/EIPS/eip-4337>
- Coinbase Smart Wallet (open source): <https://github.com/coinbase/smart-wallet>
