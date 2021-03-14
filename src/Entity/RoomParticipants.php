<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * RoomParticipants
 *
 * @ORM\Table(name="Online_Comms.Room_Participants",
 * indexes={@ORM\Index(name="fk_Room_Participants_Tutorial_Room_Table_idx", columns={"Room_ID"}), @ORM\Index(name="fk_Room_Participants_User_Table1_idx", columns={"User_ID"})})
 * @ORM\Entity
 */
class RoomParticipants
{

    /**
     * @var \App\Entity\TutorialRoomTable
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\TutorialRoomTable")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Room_ID", referencedColumnName="Room_ID")
     * })
     * @ORM\Id
     */
    private $roomId;

    /**
     * @var \App\Entity\UserTable
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\UserTable")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="User_ID", referencedColumnName="User_ID")
     * })
     * @ORM\Id
     */
    private $user;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Join_Time", type="datetime")
    */
    private $joinTime;

    /**
     * Set joinTime
     *
     * @param \DateTime $joinTime
     *
     * @return RoomParticipants
     */
    public function setJoinTime($joinTime)
    {
        $this->joinTime = $joinTime;

        return $this;
    }

    /**
     * Get joinTime
     *
     * @return \DateTime
     */
    public function getJoinTime()
    {
        return $this->joinTime;
    }

    /**
     * Set roomId
     *
     * @param \App\Entity\TutorialRoomTable $roomId
     *
     * @return RoomParticipants
     */
    public function setRoomId(\App\Entity\TutorialRoomTable $roomId = null)
    {
        $this->roomId = $roomId;

        return $this;
    }

    /**
     * Get roomId
     *
     * @return \App\Entity\TutorialRoomTable
     */
    public function getRoomId()
    {
        return $this->roomId;
    }

    /**
     * Set user
     *
     * @param \App\Entity\UserTable $user
     *
     * @return RoomParticipants
     */
    public function setUser(\App\Entity\UserTable $user = null)
    {
        $this->user = $user;

        return $this;
    }

    /**
     * Get user
     *
     * @return \App\Entity\UserTable
     */
    public function getUser()
    {
        return $this->user;
    }
}
