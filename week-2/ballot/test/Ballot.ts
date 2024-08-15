import { expect } from "chai";
import { toHex, hexToString } from "viem";
import { viem } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

async function deployContract() {
  const publicClient = await viem.getPublicClient();
  const [deployer, otherAccount, v3, v4, v5] = await viem.getWalletClients();
  const otherVoters = [v3, v4, v5];
  const ballotContract = await viem.deployContract("Ballot", [PROPOSALS.map((prop) => toHex(prop, { size: 32 }))]);
  return { publicClient, deployer, otherAccount, ballotContract, otherVoters };
}

async function giveAccountVotingRights(ballotContract: any, otherAccount: any) {
  const chairperson = await ballotContract.read.chairperson();
  await ballotContract.write.giveRightToVote([otherAccount.account.address], { account: chairperson });
  return chairperson;
}

describe("Ballot", async () => {
  describe("when the contract is deployed", async () => {
    it("has the provided proposals", async () => {
      const { ballotContract } = await loadFixture(deployContract);
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.read.proposals([BigInt(index)]);
        expect(hexToString(proposal[0], { size: 32 })).to.eq(PROPOSALS[index]);
      }
    });

    it("has zero votes for all proposals", async () => {
      const { ballotContract } = await loadFixture(deployContract);
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.read.proposals([BigInt(index)]);
        expect(proposal[1]).to.eq(0n);
      }
    });

    it("sets the deployer address as chairperson", async () => {
      const { deployer, ballotContract } = await loadFixture(deployContract);
      const chairperson = await ballotContract.read.chairperson();
      expect(deployer.account.address).to.equal(chairperson.toLowerCase());
    });
    
    it("sets the voting weight for the chairperson as 1", async () => {
      const { ballotContract } = await loadFixture(deployContract);
      const chairperson = await ballotContract.read.chairperson();
      const chairpersonVoter = await ballotContract.read.voters([chairperson]);
      expect(chairpersonVoter[0]).to.eq(1n);
    });
  });

  describe("when the chairperson interacts with the giveRightToVote function in the contract", async () => {
    it("gives right to vote for another address", async () => {
      const { otherAccount, ballotContract } = await loadFixture(deployContract);
      await giveAccountVotingRights(ballotContract, otherAccount);
      const voter = await ballotContract.read.voters([otherAccount.account.address]);
      expect(voter[0]).to.eq(1n);
    });

    it("can not give right to vote for someone that has voted", async () => {
      const { otherAccount, ballotContract } = await loadFixture(deployContract);
      const chairperson = await giveAccountVotingRights(ballotContract, otherAccount);
      await ballotContract.write.vote([0n], { account: otherAccount.account.address });
      await expect(
        ballotContract.write.giveRightToVote([otherAccount.account.address], { account: chairperson })
      ).to.be.rejectedWith("The voter already voted.");
    });

    it("can not give right to vote for someone that has already voting rights", async () => {
      const { otherAccount, ballotContract } = await loadFixture(deployContract);
      const chairperson = await giveAccountVotingRights(ballotContract, otherAccount);
      const voter = await ballotContract.read.voters([otherAccount.account.address]);
      await expect(ballotContract.write.giveRightToVote([otherAccount.account.address], { account: chairperson })).to.be
        .rejected;
    });
  });

  describe("when the voter interacts with the vote function in the contract", async () => {
    it("should register the vote", async () => {
      const { otherAccount, ballotContract } = await loadFixture(deployContract);
      await giveAccountVotingRights(ballotContract, otherAccount);
      await ballotContract.write.vote([0n], { account: otherAccount.account.address });
      const voter = await ballotContract.read.voters([otherAccount.account.address]);
      expect(voter[1]).to.eq(true);
      const proposal = await ballotContract.read.proposals([0n]);
      expect(proposal[1]).to.eq(1n);
    });
  });

  describe("when the voter interacts with the delegate function in the contract", async () => {
    it("should transfer voting power", async () => {
      const { otherAccount, ballotContract } = await loadFixture(deployContract);
      const chairperson = await giveAccountVotingRights(ballotContract, otherAccount);
      await ballotContract.write.delegate([chairperson], { account: otherAccount.account.address });
      const voter = await ballotContract.read.voters([chairperson]);
      expect(voter[0]).to.eq(2n);
    });
  });

  describe("when an account other than the chairperson interacts with the giveRightToVote function in the contract", async () => {
    it("should revert", async () => {
      const { otherAccount, ballotContract } = await loadFixture(deployContract);
      const chairperson = await ballotContract.read.chairperson();
      await expect(
        ballotContract.write.giveRightToVote([chairperson], { account: otherAccount.account.address })
      ).to.be.rejectedWith("Only chairperson can give right to vote.");
    });
  });

  describe("when an account without right to vote interacts with the vote function in the contract", async () => {
    it("should revert", async () => {
      const { otherAccount, ballotContract } = await loadFixture(deployContract);
      await expect(ballotContract.write.vote([0n], { account: otherAccount.account.address })).to.be.rejectedWith(
        "Has no right to vote"
      );
    });
  });

  describe("when an account without right to vote interacts with the delegate function in the contract", async () => {
    it("should revert", async () => {
      const { otherAccount, ballotContract } = await loadFixture(deployContract);
      const chairperson = await ballotContract.read.chairperson();
      await expect(
        ballotContract.write.delegate([chairperson], { account: otherAccount.account.address })
      ).to.be.rejectedWith("You have no right to vote");
    });
  });

  describe("when someone interacts with the winningProposal function before any votes are cast", async () => {
    it("should return 0", async () => {
      const { ballotContract } = await loadFixture(deployContract);
      const winningProposal = await ballotContract.read.winningProposal();
      expect(winningProposal).to.be.eq(0n);
    });
  });

  describe("when someone interacts with the winningProposal function after one vote is cast for the first proposal", async () => {
    it("should return 0", async () => {
      const { otherAccount, ballotContract } = await loadFixture(deployContract);
      await giveAccountVotingRights(ballotContract, otherAccount);
      await ballotContract.write.vote([0n], { account: otherAccount.account.address });
      const winningProposal = await ballotContract.read.winningProposal();
      expect(winningProposal).to.be.eq(0n);
    });
  });

  describe("when someone interacts with the winnerName function before any votes are cast", async () => {
    it("should return name of proposal 0", async () => {
      const { ballotContract } = await loadFixture(deployContract);
      const winningProposal = await ballotContract.read.winnerName();
      const proposal = await ballotContract.read.proposals([0n]);
      expect(winningProposal).to.eq(proposal[0]);
    });
  });

  describe("when someone interacts with the winnerName function after one vote is cast for the first proposal", async () => {
    it("should return name of proposal 0", async () => {
      const { otherAccount, ballotContract } = await loadFixture(deployContract);
      await giveAccountVotingRights(ballotContract, otherAccount);
      await ballotContract.write.vote([0n], { account: otherAccount.account.address });
      const winningProposal = await ballotContract.read.winnerName();
      const proposal = await ballotContract.read.proposals([0n]);
      expect(winningProposal).to.eq(proposal[0]);
    });
  });

  describe("when someone interacts with the winningProposal function and winnerName after 5 random votes are cast for the proposals", async () => {
    it("should return the name of the winner proposal", async () => {
      const { otherAccount, ballotContract, otherVoters } = await loadFixture(deployContract);
      const chairperson = await giveAccountVotingRights(ballotContract, otherAccount);

      [...otherVoters].forEach(async (voter, index) => {
        await giveAccountVotingRights(ballotContract, voter);
        await ballotContract.write.vote([BigInt(index)], { account: voter.account.address });
      });

      await ballotContract.write.vote([BigInt(1)], { account: otherAccount.account.address });
      await ballotContract.write.vote([BigInt(1)], { account: chairperson });

      const winningProposal = await ballotContract.read.winnerName();
      const proposal1 = await ballotContract.read.proposals([1n]);
      expect(winningProposal).to.eq(proposal1[0]);
    });
  });
});
