# Hack-Summit Hackathon
 
## Problem Statement

Gig workers (like Uber drivers, freelancers, etc.) struggle to get loans or financial services because banks/lenders don’t trust their income history. Even though they earn money through apps/platforms, their work history and reputation are split across multiple platforms (e.g., Uber, Fiverr, DoorDash). This makes it hard to prove they’re reliable or have steady income. Traditional systems can’t combine all these scattered records into one trustworthy "financial identity."

## Proposed Solution

We aim to combine gig workers’ scattered work history into one trusted record and use automated contracts to prove they’re trustworthy, helping them access loans and financial services by using:

### Blockchain for managing Work History
We create a secure digital record (using blockchain) that stores a gig worker’s entire work history across all platforms. Think of it as a unified report card showing their jobs, earnings, and reputation from every app they use. This helps banks/lenders see their true credibility and offer loans.

### Smart Contracts for Trust
When a gig worker takes a job, a digital agreement (smart contract) is made with their employer. This contract lists clear goals (e.g., "deliver 50 orders") and payment terms. Once the worker completes the goals, payment is sent automatically, avoiding delays. This builds a transparent track record of reliable income.

## Execution Strategy

Polygon is selected as the platform of choice, with emphasis on scalability, low transaction cost, and EVM compatibility, for the execution of our blockchain-based digital identity solution for gig workers. Smart contracts will be written with the help of Solidity and deployed on the Mumbai Testnet before a final migration to the mainnet. DIDs (Decentralized Identifiers) and VCs (Verifiable Credentials) will be implemented in line with W3C standards to guarantee interoperability. Documents required for off-chain identity verification will be stored securely on IPFS (Inter Planetary File System) and Filecoin.

In the case of front-end development, we will favor React.js (Next.js for server-side rendering) and Ethers.js for enabling interactions with blockchain. Users will be authenticated and transactions signed using MetaMask and WalletConnect. For the backend, Node.js with Express.js shall be in charge of handling API interactions with the blockchain and off-chain storage. PostgreSQL will maintain secondary data and verification requests in an efficient and accessible manner.

Security comes first, with smart contract audits carried out with OpenZeppelin and MythX used for vulnerability testing. We will provide and deploy an MVP (Minimal Viable Product) to a closed beta with gig platforms such as Upwork and Fiverr to test real-world use cases, with further refinement based on feedback to scale the solution with integration into more gig platforms and financial institutions to enable trust-based reputation scoring, furthering financial inclusion for gig workers.



