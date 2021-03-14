<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Tutorial Room Table
 *
 * @ORM\Table(name="Online_Comms.Tutorial_Servers", uniqueConstraints={@ORM\UniqueConstraint(name="Server_ID_UNIQUE", columns={"Server_ID"})})
 * @ORM\Entity
 */
class TutorialServers
{
    /**
     * @var integer
     *
     * @ORM\Column(name="Server_ID", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
    */
    private $serverId;

    /**
     * @var string
     *
     * @ORM\Column(name="End_Point", type="string", length=128, nullable=false)
    */
    private $endPoint;

    /**
     * @var integer
     *
     * @ORM\Column(name="Num_Rooms", type="integer")
    */
    private $numRooms;

    /**
     * @var string
     *
     * @ORM\Column(name="Zone", type="string", length=45, nullable=false)
    */
    private $zone;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Expected_End", type="datetime")
    */
    private $expectedEnd;

    /**
     * @var boolean
     *
     * @ORM\Column(name="isUp", type="boolean")
    */
    private $isUp;


    /**
     * Get serverId
     *
     * @return integer
     */
    public function getServerId()
    {
        return $this->serverId;
    }


    /**
     * Get endPoint
     *
     * @return string
     */
    public function getEndPoint()
    {
        return $this->endPoint;
    }

    /**
     * Add a room
     *
     *
     * @return TutorialServers
     */
    public function addRoom()
    {
        $this->numRooms++;

        return $this;
    }

    /**
     * Remove a room
     *
     *
     * @return TutorialServers
     */
    public function removeRoom()
    {
        $this->numRooms--;

        return $this;
    }

    /**
     * Get numRooms
     *
     * @return integer
     */
    public function getNumRooms()
    {
        return $this->numRooms;
    }



    /**
     * Get zone
     *
     * @return string
     */
    public function getZone()
    {
        return $this->zone;
    }

    /**
     * Set expectedEnd
     *
     * @param \DateTime $expectedEnd
     *
     * @return TutorialServers
     */
    public function setExpectedEnd($expectedEnd)
    {
        $this->expectedEnd = $expectedEnd;

        return $this;
    }

    /**
     * Get expectedEnd
     *
     * @return \DateTime
     */
    public function getExpectedEnd()
    {
        return $this->expectedEnd;
    }

    /**
     * Get isUp
     *
     * @return boolean
     */
    public function getIsUp()
    {
        return $this->isUp;
    }

    /**
     * Set isUp
     *
     * @param boolean $isUp
     *
     * @return TutorialServers
     */
    public function setIsUp($isUp)
    {
        $this->isUp = $isUp;

        return $this;
    }


    /**
     * Constructor
     */
    public function __construct()
    {

    }
}
