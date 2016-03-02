<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * PendingRoomTransaction
 *
 * @ORM\Table(name="Online_Comms.Pending_Room_Transaction", uniqueConstraints={@ORM\UniqueConstraint(name="Pending_ID_UNIQUE", columns={"Pending_ID"})},
 * indexes={@ORM\Index(name="fk_Pending_Room_Transaction_Tutorial_Room_Table1_idx", columns={"Room_ID"}), @ORM\Index(name="fk_Pending_Room_Transaction_Course_Providers1_idx", columns={"Provider_ID"}), @ORM\Index(name="fk_Pending_Room_Transaction_User_Table1_idx", columns={"Tutor_ID"})})
 * @ORM\Entity
 */
class PendingRoomTransaction
{
    /**
     * @var integer
     *
     * @ORM\Column(name="Pending_ID", type="integer")
     * @ORM\Id
    */
    private $pendId;

    /**
     * @var \AppBundle\Entity\TutorialRoomTable
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\TutorialRoomTable")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Room_ID", referencedColumnName="Room_ID")
     * })
     */
    private $roomId;

    /**
     * @var \AppBundle\Entity\CourseProviders
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\CourseProviders")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Provider_ID", referencedColumnName="Provider_ID")
     * })
     */
    private $provId;

    /**
     * @var \AppBundle\Entity\UserTable
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\UserTable")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="User_ID", referencedColumnName="User_ID")
     * })
     */
    private $tutorId;

    /**
     * @var boolean
     *
     * @ORM\Column(name="onCompletion", type="boolean")
    */
    private $onCompletion;

    /**
     * @var float
     *
     * @ORM\Column(name="Value", type="decimal", scale=4, precision=10)
    */
    private $val;

    /**
     * @var string
     *
     * @ORM\Column(name="Currency", type="string", length=4)
    */
    private $curr;


    /**
     * Set pendId
     *
     * @param integer $pendId
     *
     * @return PendingRoomTransaction
     */
    public function setPendId($pendId)
    {
        $this->pendId = $pendId;

        return $this;
    }

    /**
     * Get pendId
     *
     * @return integer
     */
    public function getPendId()
    {
        return $this->pendId;
    }

    /**
     * Set onCompletion
     *
     * @param boolean $onCompletion
     *
     * @return PendingRoomTransaction
     */
    public function setOnCompletion($onCompletion)
    {
        $this->onCompletion = $onCompletion;

        return $this;
    }

    /**
     * Get onCompletion
     *
     * @return boolean
     */
    public function getOnCompletion()
    {
        return $this->onCompletion;
    }

    /**
     * Set val
     *
     * @param string $val
     *
     * @return PendingRoomTransaction
     */
    public function setVal($val)
    {
        $this->val = $val;

        return $this;
    }

    /**
     * Get val
     *
     * @return string
     */
    public function getVal()
    {
        return $this->val;
    }

    /**
     * Set curr
     *
     * @param string $curr
     *
     * @return PendingRoomTransaction
     */
    public function setCurr($curr)
    {
        $this->curr = $curr;

        return $this;
    }

    /**
     * Get curr
     *
     * @return string
     */
    public function getCurr()
    {
        return $this->curr;
    }

    /**
     * Set roomId
     *
     * @param \AppBundle\Entity\TutorialRoomTable $roomId
     *
     * @return PendingRoomTransaction
     */
    public function setRoomId(\AppBundle\Entity\TutorialRoomTable $roomId = null)
    {
        $this->roomId = $roomId;

        return $this;
    }

    /**
     * Get roomId
     *
     * @return \AppBundle\Entity\TutorialRoomTable
     */
    public function getRoomId()
    {
        return $this->roomId;
    }

    /**
     * Set provId
     *
     * @param \AppBundle\Entity\CourseProviders $provId
     *
     * @return PendingRoomTransaction
     */
    public function setProvId(\AppBundle\Entity\CourseProviders $provId = null)
    {
        $this->provId = $provId;

        return $this;
    }

    /**
     * Get provId
     *
     * @return \AppBundle\Entity\CourseProviders
     */
    public function getProvId()
    {
        return $this->provId;
    }

    /**
     * Set tutorId
     *
     * @param \AppBundle\Entity\UserTable $tutorId
     *
     * @return PendingRoomTransaction
     */
    public function setTutorId(\AppBundle\Entity\UserTable $tutorId = null)
    {
        $this->tutorId = $tutorId;

        return $this;
    }

    /**
     * Get tutorId
     *
     * @return \AppBundle\Entity\UserTable
     */
    public function getTutorId()
    {
        return $this->tutorId;
    }
}
