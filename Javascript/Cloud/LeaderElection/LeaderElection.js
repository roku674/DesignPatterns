/**
 * Leader Election Pattern Implementation
 *
 * Leader Election ensures only one node acts as the coordinator in a distributed system.
 * Implements Bully Algorithm and Raft-like consensus for leader election.
 *
 * Key Components:
 * - Election Algorithm: Bully, Ring, or Raft-based
 * - Heartbeat System: Leader sends periodic heartbeats
 * - Failure Detection: Detect when leader fails
 * - State Management: Track node state (follower, candidate, leader)
 * - Election Coordinator: Manages election process
 */

/**
 * Node States in Leader Election
 */
const NodeState = {
    FOLLOWER: 'follower',
    CANDIDATE: 'candidate',
    LEADER: 'leader',
    DEAD: 'dead'
};

/**
 * Cluster Node
 */
class ClusterNode {
    constructor(id, priority = null) {
        this.id = id;
        this.priority = priority || id; // Higher priority = more likely to become leader
        this.state = NodeState.FOLLOWER;
        this.currentLeader = null;
        this.term = 0; // Election term (Raft-style)
        this.votedFor = null;
        this.votesReceived = 0;
        this.lastHeartbeat = Date.now();
        this.electionTimeout = this.randomElectionTimeout();
        this.heartbeatInterval = 1000;
        this.isAlive = true;
        this.listeners = [];
    }

    randomElectionTimeout() {
        return 3000 + Math.random() * 2000; // 3-5 seconds
    }

    becomeFollower(leaderId, term) {
        this.state = NodeState.FOLLOWER;
        this.currentLeader = leaderId;
        this.term = term;
        this.votedFor = null;
        this.votesReceived = 0;
        this.lastHeartbeat = Date.now();
        this.notify('state-change', { state: this.state, leaderId });
    }

    becomeCandidate() {
        this.state = NodeState.CANDIDATE;
        this.term++;
        this.votedFor = this.id;
        this.votesReceived = 1; // Vote for self
        this.currentLeader = null;
        this.notify('state-change', { state: this.state, term: this.term });
    }

    becomeLeader() {
        this.state = NodeState.LEADER;
        this.currentLeader = this.id;
        this.notify('state-change', { state: this.state });
    }

    receiveHeartbeat(leaderId, term) {
        if (term >= this.term) {
            if (this.state !== NodeState.FOLLOWER || this.currentLeader !== leaderId) {
                this.becomeFollower(leaderId, term);
            }
            this.lastHeartbeat = Date.now();
            return true;
        }
        return false;
    }

    requestVote(candidateId, term) {
        if (term < this.term) {
            return { voteGranted: false, term: this.term };
        }

        if (term > this.term) {
            this.term = term;
            this.votedFor = null;
        }

        if (this.votedFor === null || this.votedFor === candidateId) {
            this.votedFor = candidateId;
            this.lastHeartbeat = Date.now();
            return { voteGranted: true, term: this.term };
        }

        return { voteGranted: false, term: this.term };
    }

    kill() {
        this.isAlive = false;
        this.state = NodeState.DEAD;
        this.notify('node-died', { nodeId: this.id });
    }

    revive() {
        this.isAlive = true;
        this.state = NodeState.FOLLOWER;
        this.currentLeader = null;
        this.term = 0;
        this.votedFor = null;
        this.lastHeartbeat = Date.now();
        this.notify('node-revived', { nodeId: this.id });
    }

    on(event, listener) {
        this.listeners.push({ event, listener });
    }

    notify(event, data) {
        for (const { event: e, listener } of this.listeners) {
            if (e === event) {
                listener(data);
            }
        }
    }

    getInfo() {
        return {
            id: this.id,
            priority: this.priority,
            state: this.state,
            currentLeader: this.currentLeader,
            term: this.term,
            isAlive: this.isAlive
        };
    }
}

/**
 * Bully Algorithm Implementation
 */
class BullyElection {
    constructor(nodes) {
        this.nodes = nodes;
        this.electionInProgress = false;
    }

    startElection(initiatorNode) {
        if (this.electionInProgress) {
            return;
        }

        console.log(`Node ${initiatorNode.id} starting Bully election`);
        this.electionInProgress = true;
        initiatorNode.becomeCandidate();

        // Find nodes with higher priority
        const higherPriorityNodes = this.nodes.filter(n =>
            n.priority > initiatorNode.priority && n.isAlive
        );

        if (higherPriorityNodes.length === 0) {
            // No higher priority nodes, become leader
            initiatorNode.becomeLeader();
            this.announceLeader(initiatorNode);
            this.electionInProgress = false;
            return initiatorNode.id;
        }

        // Send election messages to higher priority nodes
        const responses = [];
        for (const node of higherPriorityNodes) {
            responses.push(this.sendElectionMessage(node));
        }

        // If no responses, become leader
        if (responses.every(r => !r)) {
            initiatorNode.becomeLeader();
            this.announceLeader(initiatorNode);
            this.electionInProgress = false;
            return initiatorNode.id;
        }

        // Wait for higher priority node to become leader
        this.electionInProgress = false;
        return null;
    }

    sendElectionMessage(node) {
        if (node.isAlive) {
            // Higher priority node should start its own election
            setTimeout(() => this.startElection(node), 100);
            return true;
        }
        return false;
    }

    announceLeader(leaderNode) {
        console.log(`Node ${leaderNode.id} is now the leader`);

        for (const node of this.nodes) {
            if (node.id !== leaderNode.id && node.isAlive) {
                node.becomeFollower(leaderNode.id, leaderNode.term);
            }
        }
    }
}

/**
 * Raft-like Consensus Algorithm
 */
class RaftElection {
    constructor(nodes) {
        this.nodes = nodes;
        this.electionTimeouts = new Map();

        // Start election timeouts for all nodes
        for (const node of nodes) {
            this.startElectionTimeout(node);
        }
    }

    startElectionTimeout(node) {
        if (this.electionTimeouts.has(node.id)) {
            clearTimeout(this.electionTimeouts.get(node.id));
        }

        const timeout = setTimeout(() => {
            if (node.isAlive && node.state !== NodeState.LEADER) {
                this.startElection(node);
            }
        }, node.electionTimeout);

        this.electionTimeouts.set(node.id, timeout);
    }

    startElection(candidateNode) {
        if (!candidateNode.isAlive) {
            return;
        }

        console.log(`Node ${candidateNode.id} starting Raft election for term ${candidateNode.term + 1}`);
        candidateNode.becomeCandidate();

        const aliveNodes = this.nodes.filter(n => n.isAlive && n.id !== candidateNode.id);
        const majority = Math.floor(this.nodes.length / 2) + 1;

        // Request votes from all other nodes
        for (const node of aliveNodes) {
            const response = node.requestVote(candidateNode.id, candidateNode.term);
            if (response.voteGranted) {
                candidateNode.votesReceived++;
            } else if (response.term > candidateNode.term) {
                // Another node has higher term
                candidateNode.becomeFollower(null, response.term);
                return;
            }
        }

        // Check if won election
        if (candidateNode.votesReceived >= majority) {
            candidateNode.becomeLeader();
            this.announceLeader(candidateNode);
            this.startHeartbeat(candidateNode);
        } else {
            // Lost election, become follower
            candidateNode.becomeFollower(null, candidateNode.term);
            this.startElectionTimeout(candidateNode);
        }
    }

    announceLeader(leaderNode) {
        console.log(`Node ${leaderNode.id} won election for term ${leaderNode.term}`);

        for (const node of this.nodes) {
            if (node.id !== leaderNode.id && node.isAlive) {
                node.receiveHeartbeat(leaderNode.id, leaderNode.term);
            }
        }
    }

    startHeartbeat(leaderNode) {
        const sendHeartbeat = () => {
            if (!leaderNode.isAlive || leaderNode.state !== NodeState.LEADER) {
                return;
            }

            for (const node of this.nodes) {
                if (node.id !== leaderNode.id && node.isAlive) {
                    node.receiveHeartbeat(leaderNode.id, leaderNode.term);
                }
            }

            setTimeout(sendHeartbeat, leaderNode.heartbeatInterval);
        };

        setTimeout(sendHeartbeat, leaderNode.heartbeatInterval);
    }

    detectFailures() {
        const now = Date.now();

        for (const node of this.nodes) {
            if (node.state === NodeState.FOLLOWER && node.isAlive) {
                const timeSinceHeartbeat = now - node.lastHeartbeat;
                if (timeSinceHeartbeat > node.electionTimeout) {
                    console.log(`Node ${node.id} detected leader failure, starting election`);
                    this.startElection(node);
                }
            }
        }
    }

    stopAll() {
        for (const timeout of this.electionTimeouts.values()) {
            clearTimeout(timeout);
        }
        this.electionTimeouts.clear();
    }
}

/**
 * Leader Election Coordinator
 */
class LeaderElectionCoordinator {
    constructor(nodeCount, algorithm = 'raft') {
        this.nodes = [];
        this.algorithm = algorithm;
        this.electionManager = null;

        // Create cluster nodes
        for (let i = 0; i < nodeCount; i++) {
            const node = new ClusterNode(i, i);
            this.nodes.push(node);
        }

        this.initializeElection();
    }

    initializeElection() {
        if (this.algorithm === 'bully') {
            this.electionManager = new BullyElection(this.nodes);
        } else {
            this.electionManager = new RaftElection(this.nodes);
        }
    }

    getLeader() {
        return this.nodes.find(n => n.state === NodeState.LEADER);
    }

    getAllNodeInfo() {
        return this.nodes.map(n => n.getInfo());
    }

    killNode(nodeId) {
        const node = this.nodes.find(n => n.id === nodeId);
        if (node) {
            console.log(`Killing node ${nodeId}`);
            node.kill();

            // Trigger election if leader died
            if (node.state === NodeState.LEADER || node.currentLeader === nodeId) {
                const aliveNode = this.nodes.find(n => n.isAlive);
                if (aliveNode) {
                    setTimeout(() => {
                        if (this.algorithm === 'bully') {
                            this.electionManager.startElection(aliveNode);
                        } else {
                            this.electionManager.startElection(aliveNode);
                        }
                    }, 100);
                }
            }
        }
    }

    reviveNode(nodeId) {
        const node = this.nodes.find(n => n.id === nodeId);
        if (node) {
            console.log(`Reviving node ${nodeId}`);
            node.revive();

            if (this.algorithm === 'raft') {
                this.electionManager.startElectionTimeout(node);
            }
        }
    }

    startMonitoring() {
        if (this.algorithm === 'raft') {
            this.monitoringInterval = setInterval(() => {
                this.electionManager.detectFailures();
            }, 1000);
        }
    }

    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        if (this.electionManager && this.electionManager.stopAll) {
            this.electionManager.stopAll();
        }
    }

    getStatistics() {
        const leader = this.getLeader();
        const aliveNodes = this.nodes.filter(n => n.isAlive);

        return {
            totalNodes: this.nodes.length,
            aliveNodes: aliveNodes.length,
            leader: leader ? leader.id : null,
            algorithm: this.algorithm,
            currentTerm: leader ? leader.term : 0,
            nodeStates: this.nodes.reduce((acc, n) => {
                acc[n.state] = (acc[n.state] || 0) + 1;
                return acc;
            }, {})
        };
    }
}

/**
 * Demonstration
 */
function demonstrateLeaderElection() {
    console.log('=== Leader Election Pattern Demonstration ===\n');

    // 1. Raft-based Election
    console.log('1. Raft-based Leader Election:');
    const raftCoordinator = new LeaderElectionCoordinator(5, 'raft');

    // Wait for initial election
    setTimeout(() => {
        console.log('\nInitial cluster state:');
        console.log(JSON.stringify(raftCoordinator.getStatistics(), null, 2));

        const leader = raftCoordinator.getLeader();
        console.log(`\nCurrent leader: Node ${leader.id}`);

        // Kill the leader
        console.log('\n2. Simulating leader failure...');
        raftCoordinator.killNode(leader.id);

        // Wait for new election
        setTimeout(() => {
            const newLeader = raftCoordinator.getLeader();
            console.log(`New leader elected: Node ${newLeader ? newLeader.id : 'none'}`);
            console.log('\nCluster state after re-election:');
            console.log(JSON.stringify(raftCoordinator.getStatistics(), null, 2));

            raftCoordinator.stopMonitoring();

            // 3. Bully Algorithm
            console.log('\n3. Bully Algorithm Leader Election:');
            const bullyCoordinator = new LeaderElectionCoordinator(5, 'bully');

            // Start election from lowest priority node
            const lowestNode = bullyCoordinator.nodes[0];
            bullyCoordinator.electionManager.startElection(lowestNode);

            setTimeout(() => {
                const bullyLeader = bullyCoordinator.getLeader();
                console.log(`Bully leader: Node ${bullyLeader.id} (highest priority)`);
                console.log('\nBully cluster state:');
                console.log(JSON.stringify(bullyCoordinator.getStatistics(), null, 2));
            }, 500);
        }, 4000);
    }, 5000);
}

// Run demonstration
if (require.main === module) {
    demonstrateLeaderElection();
}

module.exports = {
    NodeState,
    ClusterNode,
    BullyElection,
    RaftElection,
    LeaderElectionCoordinator
};
