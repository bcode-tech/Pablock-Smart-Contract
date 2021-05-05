// File: @openzeppelin/contracts/math/SafeMath.sol

// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

/**
 * @dev Wrappers over Solidity's arithmetic operations with added overflow
 * checks.
 *
 * Arithmetic operations in Solidity wrap on overflow. This can easily result
 * in bugs, because programmers usually assume that an overflow raises an
 * error, which is the standard behavior in high level programming languages.
 * `SafeMath` restores this intuition by reverting the transaction when an
 * operation overflows.
 *
 * Using this library instead of the unchecked operations eliminates an entire
 * class of bugs, so it's recommended to use it always.
 */
library SafeMath {
    /**
     * @dev Returns the addition of two unsigned integers, with an overflow flag.
     *
     * _Available since v3.4._
     */
    function tryAdd(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        uint256 c = a + b;
        if (c < a) return (false, 0);
        return (true, c);
    }

    /**
     * @dev Returns the substraction of two unsigned integers, with an overflow flag.
     *
     * _Available since v3.4._
     */
    function trySub(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        if (b > a) return (false, 0);
        return (true, a - b);
    }

    /**
     * @dev Returns the multiplication of two unsigned integers, with an overflow flag.
     *
     * _Available since v3.4._
     */
    function tryMul(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
        // benefit is lost if 'b' is also tested.
        // See: https://github.com/OpenZeppelin/openzeppelin-contracts/pull/522
        if (a == 0) return (true, 0);
        uint256 c = a * b;
        if (c / a != b) return (false, 0);
        return (true, c);
    }

    /**
     * @dev Returns the division of two unsigned integers, with a division by zero flag.
     *
     * _Available since v3.4._
     */
    function tryDiv(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        if (b == 0) return (false, 0);
        return (true, a / b);
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers, with a division by zero flag.
     *
     * _Available since v3.4._
     */
    function tryMod(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        if (b == 0) return (false, 0);
        return (true, a % b);
    }

    /**
     * @dev Returns the addition of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `+` operator.
     *
     * Requirements:
     *
     * - Addition cannot overflow.
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");
        return c;
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting on
     * overflow (when the result is negative).
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     *
     * - Subtraction cannot overflow.
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a, "SafeMath: subtraction overflow");
        return a - b;
    }

    /**
     * @dev Returns the multiplication of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `*` operator.
     *
     * Requirements:
     *
     * - Multiplication cannot overflow.
     */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) return 0;
        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");
        return c;
    }

    /**
     * @dev Returns the integer division of two unsigned integers, reverting on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator. Note: this function uses a
     * `revert` opcode (which leaves remaining gas untouched) while Solidity
     * uses an invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b > 0, "SafeMath: division by zero");
        return a / b;
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * reverting when dividing by zero.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b > 0, "SafeMath: modulo by zero");
        return a % b;
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting with custom message on
     * overflow (when the result is negative).
     *
     * CAUTION: This function is deprecated because it requires allocating memory for the error
     * message unnecessarily. For custom revert reasons use {trySub}.
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     *
     * - Subtraction cannot overflow.
     */
    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        return a - b;
    }

    /**
     * @dev Returns the integer division of two unsigned integers, reverting with custom message on
     * division by zero. The result is rounded towards zero.
     *
     * CAUTION: This function is deprecated because it requires allocating memory for the error
     * message unnecessarily. For custom revert reasons use {tryDiv}.
     *
     * Counterpart to Solidity's `/` operator. Note: this function uses a
     * `revert` opcode (which leaves remaining gas untouched) while Solidity
     * uses an invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b > 0, errorMessage);
        return a / b;
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * reverting with custom message when dividing by zero.
     *
     * CAUTION: This function is deprecated because it requires allocating memory for the error
     * message unnecessarily. For custom revert reasons use {tryMod}.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b > 0, errorMessage);
        return a % b;
    }
}

// File: @opengsn/gsn/contracts/interfaces/IStakeManager.sol

pragma solidity ^0.6.2;
pragma experimental ABIEncoderV2;


interface IStakeManager {

    /// Emitted when a stake or unstakeDelay are initialized or increased
    event StakeAdded(
        address indexed relayManager,
        address indexed owner,
        uint256 stake,
        uint256 unstakeDelay
    );

    /// Emitted once a stake is scheduled for withdrawal
    event StakeUnlocked(
        address indexed relayManager,
        address indexed owner,
        uint256 withdrawBlock
    );

    /// Emitted when owner withdraws relayManager funds
    event StakeWithdrawn(
        address indexed relayManager,
        address indexed owner,
        uint256 amount
    );

    /// Emitted when an authorized Relay Hub penalizes a relayManager
    event StakePenalized(
        address indexed relayManager,
        address indexed beneficiary,
        uint256 reward
    );

    event HubAuthorized(
        address indexed relayManager,
        address indexed relayHub
    );

    event HubUnauthorized(
        address indexed relayManager,
        address indexed relayHub,
        uint256 removalBlock
    );

    /// @param stake - amount of ether staked for this relay
    /// @param unstakeDelay - number of blocks to elapse before the owner can retrieve the stake after calling 'unlock'
    /// @param withdrawBlock - first block number 'withdraw' will be callable, or zero if the unlock has not been called
    /// @param owner - address that receives revenue and manages relayManager's stake
    struct StakeInfo {
        uint256 stake;
        uint256 unstakeDelay;
        uint256 withdrawBlock;
        address payable owner;
    }

    struct RelayHubInfo {
        uint256 removalBlock;
    }

    /// Put a stake for a relayManager and set its unstake delay.
    /// If the entry does not exist, it is created, and the caller of this function becomes its owner.
    /// If the entry already exists, only the owner can call this function.
    /// @param relayManager - address that represents a stake entry and controls relay registrations on relay hubs
    /// @param unstakeDelay - number of blocks to elapse before the owner can retrieve the stake after calling 'unlock'
    function stakeForAddress(address relayManager, uint256 unstakeDelay) external payable;

    function unlockStake(address relayManager) external;

    function withdrawStake(address relayManager) external;

    function authorizeHubByOwner(address relayManager, address relayHub) external;

    function authorizeHubByManager(address relayHub) external;

    function unauthorizeHubByOwner(address relayManager, address relayHub) external;

    function unauthorizeHubByManager(address relayHub) external;

    function isRelayManagerStaked(address relayManager, address relayHub, uint256 minAmount, uint256 minUnstakeDelay)
    external
    view
    returns (bool);

    /// Slash the stake of the relay relayManager. In order to prevent stake kidnapping, burns half of stake on the way.
    /// @param relayManager - entry to penalize
    /// @param beneficiary - address that receives half of the penalty amount
    /// @param amount - amount to withdraw from stake
    function penalizeRelayManager(address relayManager, address payable beneficiary, uint256 amount) external;

    function getStakeInfo(address relayManager) external view returns (StakeInfo memory stakeInfo);

    function versionSM() external view returns (string memory);
}

// File: @opengsn/gsn/contracts/StakeManager.sol

pragma solidity ^0.6.2;



contract StakeManager is IStakeManager {
    using SafeMath for uint256;

    string public override versionSM = "2.0.0+opengsn.stakemanager.istakemanager";

    /// maps relay managers to their stakes
    mapping(address => StakeInfo) public stakes;
    function getStakeInfo(address relayManager) external override view returns (StakeInfo memory stakeInfo) {
        return stakes[relayManager];
    }

    /// maps relay managers to a map of addressed of their authorized hubs to the information on that hub
    mapping(address => mapping(address => RelayHubInfo)) public authorizedHubs;

    /// Put a stake for a relayManager and set its unstake delay.
    /// If the entry does not exist, it is created, and the caller of this function becomes its owner.
    /// If the entry already exists, only the owner can call this function.
    /// @param relayManager - address that represents a stake entry and controls relay registrations on relay hubs
    /// @param unstakeDelay - number of blocks to elapse before the owner can retrieve the stake after calling 'unlock'
    function stakeForAddress(address relayManager, uint256 unstakeDelay) external override payable {
        require(stakes[relayManager].owner == address(0) || stakes[relayManager].owner == msg.sender, "not owner");
        require(unstakeDelay >= stakes[relayManager].unstakeDelay, "unstakeDelay cannot be decreased");
        require(msg.sender != relayManager, "relayManager cannot stake for itself");
        require(stakes[msg.sender].owner == address(0), "sender is a relayManager itself");
        stakes[relayManager].owner = msg.sender;
        stakes[relayManager].stake += msg.value;
        stakes[relayManager].unstakeDelay = unstakeDelay;
        emit StakeAdded(relayManager, stakes[relayManager].owner, stakes[relayManager].stake, stakes[relayManager].unstakeDelay);
    }

    function unlockStake(address relayManager) external override {
        StakeInfo storage info = stakes[relayManager];
        require(info.owner == msg.sender, "not owner");
        require(info.withdrawBlock == 0, "already pending");
        info.withdrawBlock = block.number.add(info.unstakeDelay);
        emit StakeUnlocked(relayManager, msg.sender, info.withdrawBlock);
    }

    function withdrawStake(address relayManager) external override {
        StakeInfo storage info = stakes[relayManager];
        require(info.owner == msg.sender, "not owner");
        require(info.withdrawBlock > 0, "Withdrawal is not scheduled");
        require(info.withdrawBlock <= block.number, "Withdrawal is not due");
        uint256 amount = info.stake;
        delete stakes[relayManager];
        msg.sender.transfer(amount);
        emit StakeWithdrawn(relayManager, msg.sender, amount);
    }

    modifier ownerOnly (address relayManager) {
        StakeInfo storage info = stakes[relayManager];
        require(info.owner == msg.sender, "not owner");
        _;
    }

    modifier managerOnly () {
        StakeInfo storage info = stakes[msg.sender];
        require(info.owner != address(0), "not manager");
        _;
    }

    function authorizeHubByOwner(address relayManager, address relayHub) external ownerOnly(relayManager) override {
        _authorizeHub(relayManager, relayHub);
    }

    function authorizeHubByManager(address relayHub) external managerOnly override {
        _authorizeHub(msg.sender, relayHub);
    }

    function _authorizeHub(address relayManager, address relayHub) internal {
        authorizedHubs[relayManager][relayHub].removalBlock = uint(-1);
        emit HubAuthorized(relayManager, relayHub);
    }

    function unauthorizeHubByOwner(address relayManager, address relayHub) external override ownerOnly(relayManager) {
        _unauthorizeHub(relayManager, relayHub);
    }

    function unauthorizeHubByManager(address relayHub) external override managerOnly {
        _unauthorizeHub(msg.sender, relayHub);
    }

    function _unauthorizeHub(address relayManager, address relayHub) internal {
        RelayHubInfo storage hubInfo = authorizedHubs[relayManager][relayHub];
        require(hubInfo.removalBlock == uint(-1), "hub not authorized");
        uint256 removalBlock = block.number.add(stakes[relayManager].unstakeDelay);
        hubInfo.removalBlock = removalBlock;
        emit HubUnauthorized(relayManager, relayHub, removalBlock);
    }

    function isRelayManagerStaked(address relayManager, address relayHub, uint256 minAmount, uint256 minUnstakeDelay)
    external
    override
    view
    returns (bool) {
        StakeInfo storage info = stakes[relayManager];
        bool isAmountSufficient = info.stake >= minAmount;
        bool isDelaySufficient = info.unstakeDelay >= minUnstakeDelay;
        bool isStakeLocked = info.withdrawBlock == 0;
        bool isHubAuthorized = authorizedHubs[relayManager][relayHub].removalBlock == uint(-1);
        return
        isAmountSufficient &&
        isDelaySufficient &&
        isStakeLocked &&
        isHubAuthorized;
    }

    /// Slash the stake of the relay relayManager. In order to prevent stake kidnapping, burns half of stake on the way.
    /// @param relayManager - entry to penalize
    /// @param beneficiary - address that receives half of the penalty amount
    /// @param amount - amount to withdraw from stake
    function penalizeRelayManager(address relayManager, address payable beneficiary, uint256 amount) external override {
        uint256 removalBlock =  authorizedHubs[relayManager][msg.sender].removalBlock;
        require(removalBlock != 0, "hub not authorized");
        require(removalBlock > block.number, "hub authorization expired");

        // Half of the stake will be burned (sent to address 0)
        require(stakes[relayManager].stake >= amount, "penalty exceeds stake");
        stakes[relayManager].stake = SafeMath.sub(stakes[relayManager].stake, amount);

        uint256 toBurn = SafeMath.div(amount, 2);
        uint256 reward = SafeMath.sub(amount, toBurn);

        // Ether is burned and transferred
        address(0).transfer(toBurn);
        beneficiary.transfer(reward);
        emit StakePenalized(relayManager, beneficiary, reward);
    }
}
