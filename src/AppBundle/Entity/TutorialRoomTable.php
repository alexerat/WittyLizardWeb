<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Tutorial Room Table
 *
 * @ORM\Table(name="Online_Comms.Tutorial_Room_Table", uniqueConstraints={@ORM\UniqueConstraint(name="Room_ID_UNIQUE", columns={"Room_ID"})})
 * @ORM\Entity
 */
class TutorialRoomTable
{
    /**
     * @var integer
     *
     * @ORM\Column(name="Room_ID", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
    */
    private $roomId;

    /**
     * @var string
     *
     * @ORM\Column(name="Access_Token", type="string", length=45, nullable=false)
    */
    private $accessToken;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Start_Time", type="datetime")
    */
    private $startTime;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Book_Time", type="datetime", nullable=false)
    */
    private $bookTime;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Expiry", type="datetime")
    */
    private $expiry;

    /**
     * @var integer
     *
     * @ORM\Column(name="Session_Length", type="integer")
    */
    private $sessionLength;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Host_Join_Time", type="datetime")
    */
    private $hostJoin;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Expected_Start", type="datetime")
    */
    private $expectedStart;

    /**
     * @var \Doctrine\Common\Collections\Collection|JoinWait[]
     *
     * @ORM\OneToMany(targetEntity="JoinWait", mappedBy="roomId")
     */
    private $waitingJoins;

    /**
     * @var \AppBundle\Entity\TutorialServers
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\TutorialServers")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Server_ID", referencedColumnName="Server_ID")
     * })
     */
    private $serverId;

    /**
     * Get roomId
     *
     * @return integer
     */
    public function getRoomId()
    {
        return $this->roomId;
    }

    /**
     * Set accessToken
     *
     * @param string $accessToken
     *
     * @return TutorialRoomTable
     */
    public function setAccessToken($accessToken)
    {
        $this->accessToken = $accessToken;

        return $this;
    }

    /**
     * Get accessToken
     *
     * @return string
     */
    public function getAccessToken()
    {
        return $this->accessToken;
    }

    /**
     * Set startTime
     *
     * @param \DateTime $startTime
     *
     * @return TutorialRoomTable
     */
    public function setStartTime($startTime)
    {
        $this->startTime = $startTime;

        return $this;
    }

    /**
     * Get startTime
     *
     * @return \DateTime
     */
    public function getStartTime()
    {
        return $this->startTime;
    }

    /**
     * Set bookTime
     *
     * @param \DateTime $bookTime
     *
     * @return TutorialRoomTable
     */
    public function setBookTime($bookTime)
    {
        $this->bookTime = $bookTime;

        return $this;
    }

    /**
     * Get bookTime
     *
     * @return \DateTime
     */
    public function getBookTime()
    {
        return $this->bookTime;
    }

    /**
     * Set expiry
     *
     * @param \DateTime $expiry
     *
     * @return TutorialRoomTable
     */
    public function setExpiry($expiry)
    {
        $this->expiry = $expiry;

        return $this;
    }

    /**
     * Get expiry
     *
     * @return \DateTime
     */
    public function getExpiry()
    {
        return $this->expiry;
    }

    /**
     * Set sessionLength
     *
     * @param integer $sessionLength
     *
     * @return TutorialRoomTable
     */
    public function setSessionLength($sessionLength)
    {
        $this->sessionLength = $sessionLength;

        return $this;
    }

    /**
     * Get sessionLength
     *
     * @return integer
     */
    public function getSessionLength()
    {
        return $this->sessionLength;
    }

    /**
     * Set hostJoin
     *
     * @param \DateTime $hostJoin
     *
     * @return TutorialRoomTable
     */
    public function setHostJoin($hostJoin)
    {
        $this->hostJoin = $hostJoin;

        return $this;
    }

    /**
     * Get hostJoin
     *
     * @return \DateTime
     */
    public function getHostJoin()
    {
        return $this->hostJoin;
    }

    /**
     * Set expectedStart
     *
     * @param \DateTime $expectedStart
     *
     * @return TutorialRoomTable
     */
    public function setExpectedStart($expectedStart)
    {
        $this->expectedStart = $expectedStart;

        return $this;
    }

    /**
     * Get expectedStart
     *
     * @return \DateTime
     */
    public function getExpectedStart()
    {
        return $this->expectedStart;
    }
    /**
     * Constructor
     */
    public function __construct()
    {
        $this->waitingJoins = new \Doctrine\Common\Collections\ArrayCollection();
    }

    /**
     * Add waitingJoin
     *
     * @param \AppBundle\Entity\UserTable $waitingJoin
     *
     * @return TutorialRoomTable
     */
    public function addWaitingJoin(\AppBundle\Entity\UserTable $waitingJoin)
    {
        $this->waitingJoins[] = $waitingJoin;

        return $this;
    }

    /**
     * Remove waitingJoin
     *
     * @param \AppBundle\Entity\UserTable $waitingJoin
     */
    public function removeWaitingJoin(\AppBundle\Entity\UserTable $waitingJoin)
    {
        $this->waitingJoins->removeElement($waitingJoin);
    }

    /**
     * Get waitingJoins
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getWaitingJoins()
    {
        return $this->waitingJoins;
    }

    /**
     * Set serverId
     *
     * @param \AppBundle\Entity\TutorialServers $serverId
     *
     * @return TutorialRoomTable
     */
    public function setServer(\AppBundle\Entity\TutorialServers $serverId = null)
    {
        $this->serverId = $serverId;

        return $this;
    }

    /**
     * Get serverId
     *
     * @return \AppBundle\Entity\TutorialServers
     */
    public function getServer()
    {
        return $this->serverId;
    }
}
