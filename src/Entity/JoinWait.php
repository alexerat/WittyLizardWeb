<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * JoinWait
 *
 * @ORM\Table(name="Online_Comms.Join_Wait_List",
 * indexes={@ORM\Index(name="fk_Join_Wait_List_Tutorial_Room_Table1_idx", columns={"Room_ID"}), @ORM\Index(name="fk_Join_Wait_List_User_Table1_idx", columns={"User_ID"})})
 * @ORM\Entity
 */
class JoinWait
{

    /**
     * @var \App\Entity\TutorialRoomTable
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\TutorialRoomTable", inversedBy="waitingJoins")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Room_ID", referencedColumnName="Room_ID")
     * })
     * @ORM\Id
     */
    private $roomId;

    /**
     * @var \App\Entity\UserTable
     *
     * @ORM\OneToOne(targetEntity="App\Entity\UserTable", inversedBy="waitingJoin")
     * @ORM\JoinColumn(name="User_ID", referencedColumnName="User_ID")
     * @ORM\Id
     */
    private $user;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Attempt_Time", type="datetime")
    */
    private $joinTime;

    /**
     * Set joinTime
     *
     * @param \DateTime $joinTime
     *
     * @return JoinWait
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
     * @return JoinWait
     */
    public function setRoomId(\App\Entity\TutorialRoomTable $roomId)
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
     * @return JoinWait
     */
    public function setUser(\App\Entity\UserTable $user)
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
